<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductListing extends Model
{
    protected $guarded = [];

    protected $casts = [
        'featured_image' => 'array',
        'is_published' => 'boolean',
    ];

    public function product() {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
