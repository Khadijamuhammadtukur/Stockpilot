<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'user_name', 'user_role', 'action', 'category',
        'description', 'entity_type', 'entity_id', 'exact_timestamp'
    ];

    protected $casts = [
        'exact_timestamp' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
