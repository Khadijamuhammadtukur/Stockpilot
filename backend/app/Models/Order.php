<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'customer_id', 'customer_name', 'customer_email',
        'customer_phone', 'shipping_address', 'subtotal', 'discount_amount',
        'total_amount', 'total_cost', 'gross_profit', 'payment_status',
        'order_status', 'payment_method', 'transaction_reference', 'user_id'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }

    public function deliveryAddress()
    {
        return $this->hasOne(DeliveryAddress::class);
    }
}
