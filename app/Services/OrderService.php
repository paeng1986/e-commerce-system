<?php

namespace App\Services;

use App\Models\Order;

class OrderService
{

    public function paginate(int $perPage = 25, ?string $search = null, ?string $category = null)
    {

        return Order::query()
            ->with(['items','customer'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'order_code' => "#ORD-000" . $item->id,
                    'customer_id' => $item->customer?->id ?? null,
                    'customer_name' => $item->customer?->name ?? null,
                    'no_of_items' => $item->items->count() ?? 0,
                    'items' => $item->item_data,
                    'total' => $item->total,
                    'date' => date('M d,Y', strtotime($item->created_at)),
                    'status' => ucwords($item->status),
                ];
            });

    }
    
}
