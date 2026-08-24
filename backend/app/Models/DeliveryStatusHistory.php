<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryStatusHistory extends Model
{
    protected $fillable = [
        'delivery_id',
        'status',
        'note',
        'changed_by_user_id',
        'changed_by_name',
        'exact_timestamp',
    ];

    protected $casts = [
        'exact_timestamp' => 'datetime',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
