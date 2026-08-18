<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    protected $fillable = [
        'product_id', 'variation_id', 'type', 'qty_change',
        'previous_qty', 'new_qty', 'reference', 'notes',
        'user_id', 'exact_timestamp'
    ];

    protected $casts = [
        'exact_timestamp' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
