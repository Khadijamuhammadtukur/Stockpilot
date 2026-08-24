<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $fillable = [
        'order_id',
        'delivery_method',
        'delivery_zone_id',
        'delivery_fee',
        'tracking_number',
        'delivery_status',
        'assigned_to',
        'estimated_delivery_date',
        'dispatched_at',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'delivery_fee' => 'float',
        'estimated_delivery_date' => 'datetime',
        'dispatched_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function zone()
    {
        return $this->belongsTo(DeliveryZone::class, 'delivery_zone_id');
    }

    public function courier()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function address()
    {
        return $this->hasOne(DeliveryAddress::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(DeliveryStatusHistory::class)->orderBy('exact_timestamp', 'desc');
    }
}
