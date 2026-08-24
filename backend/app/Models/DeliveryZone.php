<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    protected $fillable = [
        'name',
        'city_region',
        'standard_fee',
        'express_fee',
        'estimated_delivery_time',
        'is_active',
    ];

    protected $casts = [
        'standard_fee' => 'float',
        'express_fee' => 'float',
        'is_active' => 'boolean',
    ];

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }
}
