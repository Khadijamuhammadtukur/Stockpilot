<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'category_id', 'supplier_id',
        'sku', 'barcode', 'cost_price', 'selling_price', 'discount_price',
        'stock', 'min_stock', 'max_stock', 'status', 'is_featured', 'main_image'
    ];

    protected $appends = ['stock_status', 'profit_margin'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class)->orderBy('exact_timestamp', 'desc');
    }

    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) {
            return 'out_of_stock';
        } elseif ($this->stock <= 2) {
            return 'critical_stock';
        } elseif ($this->stock <= $this->min_stock) {
            return 'low_stock';
        }
        return 'healthy';
    }

    public function getProfitMarginAttribute()
    {
        if ($this->selling_price <= 0) return 0;
        $profit = $this->selling_price - $this->cost_price;
        return round(($profit / $this->selling_price) * 100, 1);
    }
}
