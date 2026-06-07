<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PcBuildItem extends Model
{
    protected $guarded = [];

    protected $casts = [
        'spec_snapshot' => 'array',
        'price_snapshot' => 'decimal:2',
    ];

    public function build()
    {
        return $this->belongsTo(PcBuild::class, 'pc_build_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
