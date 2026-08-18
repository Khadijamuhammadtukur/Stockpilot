<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\InventoryMovement;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Public Customer Storefront Catalog Listing
     * Intelligent Stock Visibility: Automatically filters out stock <= 0
     */
    public function storefrontIndex(Request $request)
    {
        $query = Product::with(['category', 'images'])
            ->where('status', 'active')
            ->where('stock', '>', 0); // Intelligent Stock Visibility filter

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('min_price')) {
            $query->where('selling_price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('selling_price', '<=', $request->max_price);
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        if ($sort === 'price_asc') {
            $query->orderBy('selling_price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('selling_price', 'desc');
        } elseif ($sort === 'popular') {
            $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return response()->json($query->paginate(12));
    }

    /**
     * Storefront Product Detail Page
     */
    public function storefrontShow($slug)
    {
        $product = Product::with(['category', 'supplier', 'images', 'variations'])
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('id', $slug);
            })
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json($product);
    }

    /**
     * Admin Product Management Catalog
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier', 'variations']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('stock_filter')) {
            $filter = $request->stock_filter;
            if ($filter === 'low_stock') {
                $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'min_stock');
            } elseif ($filter === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }
        }

        return response()->json($query->orderBy('updated_at', 'desc')->get());
    }

    /**
     * Create Product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'sku' => 'required|string|unique:products,sku',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer',
            'max_stock' => 'nullable|integer',
            'description' => 'nullable|string',
            'main_image' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);
        $product = Product::create($validated);

        // Record Initial Stock Movement
        if ($product->stock > 0) {
            InventoryMovement::create([
                'product_id' => $product->id,
                'type' => 'receive',
                'qty_change' => $product->stock,
                'previous_qty' => 0,
                'new_qty' => $product->stock,
                'reference' => 'INIT-STOCK',
                'notes' => 'Initial inventory setup',
                'exact_timestamp' => now(),
            ]);
        }

        // Audit Log
        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role?->name ?? 'admin',
            'action' => 'PRODUCT_CREATED',
            'category' => 'product',
            'description' => "Created product {$product->name} (SKU: {$product->sku}) with initial stock of {$product->stock}.",
            'entity_type' => Product::class,
            'entity_id' => $product->id,
            'exact_timestamp' => now(),
        ]);

        return response()->json($product->load(['category', 'supplier']), 201);
    }

    /**
     * Update Product Details / Pricing
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'cost_price' => 'sometimes|numeric|min:0',
            'selling_price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'min_stock' => 'sometimes|integer|min:0',
            'category_id' => 'nullable',
            'supplier_id' => 'nullable',
            'description' => 'nullable|string',
        ]);

        $product->update($validated);

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role?->name ?? 'admin',
            'action' => 'PRODUCT_UPDATED',
            'category' => 'product',
            'description' => "Updated pricing/details for {$product->name}. Cost: ₦{$product->cost_price}, Selling: ₦{$product->selling_price}",
            'entity_type' => Product::class,
            'entity_id' => $product->id,
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'product' => $product->fresh()->load(['category', 'supplier']),
            'message' => 'Product details updated successfully.'
        ]);
    }

    /**
     * Update Stock / Adjust Quantity
     */
    public function adjustStock(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'qty_change' => 'required|integer', // Positive for add, negative for deduct
            'type' => 'required|in:receive,adjustment,damaged,lost,return,manual_correction',
            'reason' => 'nullable|string',
            'reference' => 'nullable|string',
            'cost_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
        ]);

        $prevQty = $product->stock;
        $qtyChange = (int)$validated['qty_change'];
        $newQty = max(0, $prevQty + $qtyChange);

        $updateData = ['stock' => $newQty];
        if (isset($validated['cost_price']) && !is_null($validated['cost_price'])) {
            $updateData['cost_price'] = $validated['cost_price'];
        }
        if (isset($validated['selling_price']) && !is_null($validated['selling_price'])) {
            $updateData['selling_price'] = $validated['selling_price'];
        }

        $product->update($updateData);

        // Record Inventory Timeline Event
        $movement = InventoryMovement::create([
            'product_id' => $product->id,
            'type' => $validated['type'],
            'qty_change' => $qtyChange,
            'previous_qty' => $prevQty,
            'new_qty' => $newQty,
            'reference' => $validated['reference'] ?? 'MANUAL-ADJ',
            'notes' => $validated['reason'] ?? 'Manual stock adjustment',
            'user_id' => $request->user()?->id,
            'exact_timestamp' => now(),
        ]);

        // Record Audit Log
        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role?->name ?? 'inventory_staff',
            'action' => 'STOCK_ADJUSTED',
            'category' => 'inventory',
            'description' => "Adjusted stock for {$product->name} ({$prevQty} → {$newQty}). Type: {$validated['type']}. Notes: {$validated['reason']}",
            'entity_type' => Product::class,
            'entity_id' => $product->id,
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'product' => $product->fresh(),
            'movement' => $movement,
            'message' => "Stock successfully updated. Current stock is now {$newQty} units."
        ]);
    }

    /**
     * Product Performance Profile & History Timeline
     */
    public function performanceProfile($id)
    {
        $product = Product::with(['category', 'supplier', 'variations', 'inventoryMovements.user'])
            ->findOrFail($id);

        $unitsSold = InventoryMovement::where('product_id', $id)
            ->where('type', 'sale')
            ->sum(DB::raw('ABS(qty_change)'));

        $totalRevenue = $unitsSold * $product->selling_price;
        $totalProfit = $unitsSold * ($product->selling_price - $product->cost_price);

        return response()->json([
            'product' => $product,
            'analytics' => [
                'units_sold' => $unitsSold,
                'total_revenue' => $totalRevenue,
                'estimated_profit' => $totalProfit,
                'profit_margin' => $product->profit_margin,
                'turnover_velocity' => $unitsSold > 20 ? 'Fast Moving' : ($unitsSold > 5 ? 'Moderate' : 'Slow Moving'),
            ],
            'timeline' => $product->inventoryMovements
        ]);
    }
}
