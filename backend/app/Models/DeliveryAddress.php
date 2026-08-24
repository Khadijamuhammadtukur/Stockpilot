<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryAddress extends Model
{
    protected $fillable = [
        'order_id',
        'delivery_id',
        'recipient_name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'landmark',
        'delivery_notes',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
