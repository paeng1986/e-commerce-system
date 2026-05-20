<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    public $appends = ['category'];

    public function categories() {
        return $this->belongsTo(ProductCategory::class, 'product_category_id', 'id');
    }

    public function getCategoryAttribute() {
        return $this->categories->title ?? "";
    }

    public function listing() {
        return $this->belongsTo(ProductListing::class);
    }


}
