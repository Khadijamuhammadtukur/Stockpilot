<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\InventoryMovement;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    public function index()
    {
        return response()->json(Purchase::with(['supplier', 'items.product', 'user'])->orderBy('received_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable', // Existing supplier ID
            'new_supplier_name' => 'nullable|string|max:255', // On-the-fly new supplier
            'supplier_representative' => 'nullable|string|max:255', // Person who delivered/supplied
            'received_at' => 'nullable|date', // Date & time of supply
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty_ordered' => 'required|integer|min:1',
            'items.*.cost_price' => 'required|numeric|min:0',
            'items.*.selling_price' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $supplierId = null;
            $supplierName = 'Unknown Supplier';

            if (!empty($validated['supplier_id'])) {
                $supplier = Supplier::find($validated['supplier_id']);
                if ($supplier) {
                    $supplierId = $supplier->id;
                    $supplierName = $supplier->name;
                }
            } elseif (!empty($validated['new_supplier_name'])) {
                $newSupplier = Supplier::firstOrCreate(
                    ['name' => trim($validated['new_supplier_name'])],
                    ['contact_person' => $validated['supplier_representative'] ?? null]
                );
                $supplierId = $newSupplier->id;
                $supplierName = $newSupplier->name;
            }

            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $subtotal = $item['cost_price'] * $item['qty_ordered'];
                $totalAmount += $subtotal;
                $itemsToCreate[] = [
                    'product_id' => $item['product_id'],
                    'qty_ordered' => $item['qty_ordered'],
                    'qty_received' => $item['qty_ordered'], // Received upon creation
                    'cost_price' => $item['cost_price'],
                    'selling_price' => $item['selling_price'] ?? null,
                    'subtotal' => $subtotal,
                ];
            }

            $purchaseNumber = 'PO-' . strtoupper(Str::random(6));
            $staffName = $request->user()?->name ?? 'Staff User';
            $deliveryDateTime = !empty($validated['received_at']) ? $validated['received_at'] : now();

            $purchase = Purchase::create([
                'purchase_number' => $purchaseNumber,
                'supplier_id' => $supplierId,
                'supplier_name' => $supplierName,
                'supplier_representative' => $validated['supplier_representative'] ?? 'Delivery Agent',
                'staff_receiver_name' => $staffName,
                'total_amount' => $totalAmount,
                'status' => 'received',
                'user_id' => $request->user()?->id,
                'notes' => $validated['notes'] ?? 'Supplier restock purchase',
                'received_at' => $deliveryDateTime,
            ]);

            foreach ($itemsToCreate as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'qty_ordered' => $item['qty_ordered'],
                    'qty_received' => $item['qty_received'],
                    'cost_price' => $item['cost_price'],
                    'subtotal' => $item['subtotal'],
                ]);

                $product = Product::find($item['product_id']);
                $prevStock = $product->stock;
                $newStock = $prevStock + $item['qty_received'];

                $updateData = [
                    'stock' => $newStock,
                    'cost_price' => $item['cost_price'], // Update latest cost price
                ];
                if (!empty($item['selling_price'])) {
                    $updateData['selling_price'] = $item['selling_price'];
                }

                $product->update($updateData);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'receive',
                    'qty_change' => $item['qty_received'],
                    'previous_qty' => $prevStock,
                    'new_qty' => $newStock,
                    'reference' => $purchaseNumber,
                    'notes' => "Restocked from {$supplierName} (Delivered by: " . ($validated['supplier_representative'] ?? 'Agent') . ")",
                    'user_id' => $request->user()?->id,
                    'exact_timestamp' => $deliveryDateTime,
                ]);
            }

            AuditLog::create([
                'user_name' => $staffName,
                'user_role' => $request->user()?->role?->name ?? 'staff',
                'action' => 'STOCK_RECEIVED',
                'category' => 'inventory',
                'description' => "PO {$purchaseNumber} received from {$supplierName} (Delivered by: " . ($validated['supplier_representative'] ?? 'Representative') . "). Verified by {$staffName}.",
                'entity_type' => Purchase::class,
                'entity_id' => $purchase->id,
                'exact_timestamp' => $deliveryDateTime,
            ]);

            return response()->json([
                'message' => 'Stock successfully received and inventory updated.',
                'purchase' => $purchase->load(['supplier', 'items.product']),
            ], 201);
        });
    }
}
