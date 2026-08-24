<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\AuditLog;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
            'shipping_address' => 'nullable|string',
            'payment_method' => 'required|string|in:online_paystack,cash,card_pos,bank_transfer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_method' => 'nullable|string|in:standard,express,pickup',
            'delivery_zone_id' => 'nullable|exists:delivery_zones,id',
            'recipient_name' => 'nullable|string',
            'recipient_phone' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'landmark' => 'nullable|string',
            'delivery_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $totalCost = 0;
            $itemsToProcess = [];

            foreach ($validated['items'] as $itemData) {
                $product = Product::lockForUpdate()->find($itemData['product_id']);
                
                if (!$product || $product->status !== 'active') {
                    return response()->json([
                        'error' => "Product '{$itemData['product_id']}' is no longer available."
                    ], 422);
                }

                if ($product->stock < $itemData['quantity']) {
                    return response()->json([
                        'error' => "Insufficient stock for '{$product->name}'. Available: {$product->stock}, Requested: {$itemData['quantity']}."
                    ], 422);
                }

                $itemSubtotal = $product->selling_price * $itemData['quantity'];
                $itemCost = $product->cost_price * $itemData['quantity'];

                $subtotal += $itemSubtotal;
                $totalCost += $itemCost;

                $itemsToProcess[] = [
                    'product' => $product,
                    'quantity' => $itemData['quantity'],
                    'price' => $product->selling_price,
                    'cost_price' => $product->cost_price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $deliveryFee = 0.00;
            $deliveryMethod = $validated['delivery_method'] ?? 'standard';
            $zoneId = $validated['delivery_zone_id'] ?? null;

            if ($zoneId && $deliveryMethod !== 'pickup') {
                $zone = \App\Models\DeliveryZone::find($zoneId);
                if ($zone) {
                    $deliveryFee = ($deliveryMethod === 'express') ? $zone->express_fee : $zone->standard_fee;
                }
            }

            $orderNumber = 'ORD-' . strtoupper(Str::random(8));
            $totalAmount = $subtotal + $deliveryFee;
            $grossProfit = $subtotal - $totalCost;

            $customer = Customer::firstOrCreate(
                ['email' => $validated['customer_email']],
                [
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone'] ?? null,
                    'shipping_address' => $validated['shipping_address'] ?? null,
                ]
            );

            $customer->increment('order_count');
            $customer->increment('total_spend', $totalAmount);

            $isPaid = in_array($validated['payment_method'], ['cash', 'card_pos', 'bank_transfer', 'online_paystack']);
            
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'gross_profit' => $grossProfit,
                'payment_status' => $isPaid ? 'paid' : 'pending',
                'order_status' => $isPaid ? 'processing' : 'pending',
                'payment_method' => $validated['payment_method'],
                'transaction_reference' => 'PAY-' . strtoupper(Str::random(10)),
                'user_id' => $request->user()?->id,
            ]);

            $trackingNumber = 'TRK-' . strtoupper(Str::random(8));
            $delivery = \App\Models\Delivery::create([
                'order_id' => $order->id,
                'delivery_method' => $deliveryMethod,
                'delivery_zone_id' => $zoneId,
                'delivery_fee' => $deliveryFee,
                'tracking_number' => $trackingNumber,
                'delivery_status' => 'processing',
                'notes' => $validated['delivery_notes'] ?? null,
            ]);

            \App\Models\DeliveryAddress::create([
                'order_id' => $order->id,
                'delivery_id' => $delivery->id,
                'recipient_name' => $validated['recipient_name'] ?? $validated['customer_name'],
                'phone' => $validated['recipient_phone'] ?? $validated['customer_phone'] ?? 'N/A',
                'email' => $validated['customer_email'],
                'address' => $validated['shipping_address'] ?? 'In-Store Pickup',
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'landmark' => $validated['landmark'] ?? null,
                'delivery_notes' => $validated['delivery_notes'] ?? null,
            ]);

            \App\Models\DeliveryStatusHistory::create([
                'delivery_id' => $delivery->id,
                'status' => 'processing',
                'note' => 'Order placed successfully. Package prepared for dispatch.',
                'changed_by_name' => $validated['customer_name'],
                'exact_timestamp' => now(),
            ]);

            foreach ($itemsToProcess as $item) {
                $product = $item['product'];
                $prevStock = $product->stock;
                $newStock = $prevStock - $item['quantity'];

                $product->update(['stock' => $newStock]);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $item['price'],
                    'cost_price' => $item['cost_price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'sale',
                    'qty_change' => -$item['quantity'],
                    'previous_qty' => $prevStock,
                    'new_qty' => $newStock,
                    'reference' => $orderNumber,
                    'notes' => "Sale via Order {$orderNumber}",
                    'user_id' => $request->user()?->id,
                    'exact_timestamp' => now(),
                ]);
            }

            if ($isPaid) {
                Payment::create([
                    'order_id' => $order->id,
                    'reference' => $order->transaction_reference,
                    'gateway' => $validated['payment_method'],
                    'amount' => $totalAmount,
                    'status' => 'successful',
                    'gateway_response' => ['status' => 'success', 'message' => 'Approved'],
                ]);
            }

            AuditLog::create([
                'user_name' => $validated['customer_name'],
                'user_role' => 'customer',
                'action' => 'ORDER_CREATED',
                'category' => 'sales',
                'description' => "Order {$orderNumber} placed for " . count($itemsToProcess) . " items worth ₦" . number_format($totalAmount, 2) . " (Tracking: {$trackingNumber})",
                'entity_type' => Order::class,
                'entity_id' => $order->id,
                'exact_timestamp' => now(),
            ]);

            return response()->json([
                'message' => 'Order created successfully!',
                'order' => $order->load(['items.product', 'delivery.zone', 'deliveryAddress']),
                'tracking_number' => $trackingNumber,
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'customer']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($request->has('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'customer', 'payments', 'user'])
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_status' => 'required|in:pending,paid,processing,ready,shipped,completed,cancelled,refunded',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
        ]);

        $order->update($validated);

        AuditLog::create([
            'user_name' => $request->user()?->name ?? 'Staff',
            'user_role' => $request->user()?->role?->name ?? 'sales_staff',
            'action' => 'ORDER_STATUS_UPDATED',
            'category' => 'order',
            'description' => "Order {$order->order_number} status updated to " . strtoupper($order->order_status),
            'entity_type' => Order::class,
            'entity_id' => $order->id,
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'order' => $order->fresh(),
            'message' => "Order status updated to {$order->order_status}."
        ]);
    }
}
