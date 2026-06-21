<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public const STATUSES = [
        'pending',
        'processing',
        'assembling',
        'ready',
        'delivered',
        'cancelled',
    ];

    private const STOCKED_STATUSES = [
        'assembling',
        'ready',
        'delivered',
    ];

    private const ALLOWED_TRANSITIONS = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['assembling', 'cancelled'],
        'assembling' => ['ready', 'cancelled'],
        'ready' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function paginate(int $perPage = 25, ?string $search = null, ?string $status = null)
    {
        $status = $status ? strtolower($status) : null;

        return Order::query()
            ->with(['items', 'customer'])
            ->when($status && in_array($status, self::STATUSES, true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'order_code' => '#ORD-000'.$item->id,
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

    public function forCustomer(int $customerId): array
    {
        return Order::query()
            ->with('items')
            ->where('customer_id', $customerId)
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => sprintf('NV-%05d', $order->id),
                    'status' => ucwords($order->status),
                    'total' => (float) $order->total,
                    'no_of_items' => (int) $order->items->sum('quantity'),
                    'date' => $order->created_at?->format('M d, Y'),
                    'items' => $order->items->map(fn ($item) => [
                        'name' => $item->product_name_snapshot,
                        'quantity' => (int) $item->quantity,
                        'price' => (float) $item->unit_price_snapshot,
                    ])->values(),
                ];
            })
            ->all();
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $status = strtolower($status);

        if (! in_array($status, self::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => 'The selected status is invalid.',
            ]);
        }

        return DB::transaction(function () use ($order, $status) {
            $order = Order::query()
                ->with('items')
                ->lockForUpdate()
                ->findOrFail($order->id);

            $currentStatus = strtolower($order->status);

            if ($currentStatus === $status) {
                return $order->load(['items', 'customer']);
            }

            if (! in_array($status, self::ALLOWED_TRANSITIONS[$currentStatus] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => 'This order cannot be moved to the selected status.',
                ]);
            }

            $currentlyHoldsStock = in_array($currentStatus, self::STOCKED_STATUSES, true);
            $nextHoldsStock = in_array($status, self::STOCKED_STATUSES, true);

            if (! $currentlyHoldsStock && $nextHoldsStock) {
                $this->decrementProductStock($order);
            }

            if ($currentlyHoldsStock && ! $nextHoldsStock) {
                $this->incrementProductStock($order);
            }

            $order->status = $status;
            $order->save();

            return $order->load(['items', 'customer']);
        });
    }

    public function decrementProductStock(Order $order): void
    {
        $quantities = $this->productQuantities($order);

        foreach ($quantities as $productId => $quantity) {
            $product = Product::query()->lockForUpdate()->find($productId);

            if (! $product) {
                continue;
            }

            if ($product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'stock' => "Not enough stock for {$product->name}.",
                ]);
            }

            $product->decrement('stock', $quantity);
        }
    }

    public function incrementProductStock(Order $order): void
    {
        foreach ($this->productQuantities($order) as $productId => $quantity) {
            Product::query()
                ->whereKey($productId)
                ->increment('stock', $quantity);
        }
    }

    private function productQuantities(Order $order): array
    {
        return $order->items
            ->whereNotNull('product_id')
            ->groupBy('product_id')
            ->map(fn ($items) => $items->sum('quantity'))
            ->all();
    }
}
