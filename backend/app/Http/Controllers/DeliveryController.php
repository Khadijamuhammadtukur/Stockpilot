<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryAddress;
use App\Models\DeliveryStatusHistory;
use App\Models\DeliveryZone;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $query = Delivery::with(['order', 'zone', 'courier', 'address', 'statusHistories']);

        if ($request->filled('status')) {
            $query->where('delivery_status', $request->status);
        }

        if ($request->filled('zone_id')) {
            $query->where('delivery_zone_id', $request->zone_id);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                  ->orWhereHas('address', function ($aq) use ($search) {
                      $aq->where('recipient_name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%")
                         ->orWhere('address', 'like', "%{$search}%");
                  });
            });
        }

        $deliveries = $query->orderBy('updated_at', 'desc')->get();

        return response()->json($deliveries);
    }

    public function show($tracking_number)
    {
        $delivery = Delivery::with([
            'order.items',
            'zone',
            'courier',
            'address',
            'statusHistories' => function ($q) {
                $q->orderBy('exact_timestamp', 'desc');
            }
        ])->where('tracking_number', $tracking_number)->first();

        if (!$delivery) {
            return response()->json(['error' => 'Tracking number not found.'], 404);
        }

        return response()->json([
            'delivery' => $delivery,
            'gps_status' => 'coming_soon',
            'gps_notice' => 'Live GPS Tracking — Coming Soon',
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,ready_for_dispatch,dispatched,in_transit,out_for_delivery,delivered,delivery_failed,cancelled,returned',
            'note' => 'nullable|string',
            'estimated_delivery_date' => 'nullable|date',
        ]);

        $delivery = Delivery::findOrFail($id);
        $oldStatus = $delivery->delivery_status;
        $delivery->delivery_status = $validated['status'];

        if (!empty($validated['estimated_delivery_date'])) {
            $delivery->estimated_delivery_date = $validated['estimated_delivery_date'];
        }

        if ($validated['status'] === 'dispatched' && !$delivery->dispatched_at) {
            $delivery->dispatched_at = now();
        }

        if ($validated['status'] === 'delivered') {
            $delivery->delivered_at = now();
            if ($delivery->order) {
                $delivery->order->update(['order_status' => 'completed']);
            }
        }

        $delivery->save();

        $userName = $request->user()?->name ?? $request->input('staff_name') ?? 'Admin/Staff';

        DeliveryStatusHistory::create([
            'delivery_id' => $delivery->id,
            'status' => $validated['status'],
            'note' => $validated['note'] ?? "Status updated from '{$oldStatus}' to '{$validated['status']}'.",
            'changed_by_user_id' => $request->user()?->id,
            'changed_by_name' => $userName,
            'exact_timestamp' => now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'user_name' => $userName,
            'user_role' => $request->user()?->role?->name ?? 'staff',
            'action' => 'DELIVERY_STATUS_UPDATED',
            'category' => 'sales',
            'description' => "Updated Delivery {$delivery->tracking_number} status to '{$validated['status']}'.",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'message' => "Delivery status updated to {$validated['status']}.",
            'delivery' => $delivery->fresh(['statusHistories', 'courier', 'address', 'zone']),
        ]);
    }

    public function assignStaff(Request $request, $id)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $delivery = Delivery::findOrFail($id);
        $delivery->assigned_to = $validated['assigned_to'];
        
        // Automated status advancement: move from pending/processing to ready_for_dispatch
        if (in_array($delivery->delivery_status, ['pending', 'processing'])) {
            $delivery->delivery_status = 'ready_for_dispatch';
        }

        $delivery->save();

        $courier = User::find($validated['assigned_to']);
        $userName = $request->user()?->name ?? 'Admin';

        DeliveryStatusHistory::create([
            'delivery_id' => $delivery->id,
            'status' => $delivery->delivery_status,
            'note' => "Automated System Update: Package assigned to courier driver {$courier->name} and marked Ready for Dispatch.",
            'changed_by_user_id' => $request->user()?->id,
            'changed_by_name' => $userName,
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'message' => "Delivery assigned to {$courier->name} and marked Ready for Dispatch.",
            'delivery' => $delivery->fresh(['courier', 'statusHistories']),
        ]);
    }

    public function myDeliveries(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([]);
        }

        $deliveries = Delivery::with(['order.items', 'zone', 'address', 'statusHistories'])
            ->where('assigned_to', $user->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($deliveries);
    }

    public function deliveryZones()
    {
        $zones = DeliveryZone::where('is_active', true)->get();
        return response()->json($zones);
    }

    public function allZones()
    {
        $zones = DeliveryZone::all();
        return response()->json($zones);
    }

    public function storeZone(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city_region' => 'required|string|max:255',
            'standard_fee' => 'required|numeric|min:0',
            'express_fee' => 'nullable|numeric|min:0',
            'estimated_delivery_time' => 'nullable|string',
        ]);

        $zone = DeliveryZone::create($validated);

        return response()->json([
            'message' => 'Delivery zone created successfully!',
            'zone' => $zone,
        ]);
    }

    public function updateZone(Request $request, $id)
    {
        $zone = DeliveryZone::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'city_region' => 'sometimes|string|max:255',
            'standard_fee' => 'sometimes|numeric|min:0',
            'express_fee' => 'nullable|numeric|min:0',
            'estimated_delivery_time' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $zone->update($validated);

        return response()->json([
            'message' => 'Delivery zone updated successfully!',
            'zone' => $zone,
        ]);
    }
}
