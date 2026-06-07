<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PcBuild extends Model
{
    protected $guarded = [];

    protected $casts = [
        'estimated_total_price' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(PcBuildItem::class);
    }

    public function listing()
    {
        return $this->hasOne(PcBuildListing::class);
    }
}
