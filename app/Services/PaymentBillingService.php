<?php

namespace App\Services;

use App\Models\Payment;

class PaymentBillingService
{
    public function paginate(int $perPage = 25, ?string $search = null, ?string $category = null)
    {

        return Payment::query()
            ->with('order')
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'invoice_id' => "INV-000" . $item->id,
                    'order_code' => "#ORD-000" . $item->order_id,
                    'customer_id' => $item->order?->customer?->id ?? null,
                    'customer_name' => $item->order?->customer?->name ?? null,
                    'amount' => (float) $item->amount ?? 0,
                    'provider' => $item->provider,
                    'method' => $item->method,
                    'paid_at' => date('M d,Y', strtotime($item->paid_at)),
                    'status' => ucwords($item->status),
                ];
            });

    }
}
