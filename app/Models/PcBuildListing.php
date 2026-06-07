<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PcBuildListing extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'selling_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    public function build()
    {
        return $this->belongsTo(PcBuild::class, 'pc_build_id');
    }
}
