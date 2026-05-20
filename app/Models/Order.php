<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];

    public $appends = ['item_data'];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function getItemDataAttribute() {

        if(!$this->items) return [];
        $arr = [];
        foreach($this->items as $item) {
            $arr[] = [
                'product_name' => $item->product_name_snapshot,
                'unit_price' => $item->unit_price_snapshot,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
            ];
        }

        return $arr;

    }
}
