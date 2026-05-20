<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.listing_id' => ['required', 'integer', 'exists:product_listings,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();

        if (! $user || $user->role !== 'customer') {
            throw ValidationException::withMessages([
                'checkout' => 'Please sign in with a customer account before placing an order.',
            ]);
        }

        $quantities = collect($data['items'])
            ->groupBy('listing_id')
            ->map(fn ($items) => $items->sum('quantity'));

        $listings = ProductListing::query()
            ->with('product.categories')
            ->whereIn('id', $quantities->keys())
            ->where('is_published', true)
            ->get()
            ->keyBy('id');

        if ($listings->count() !== $quantities->count()) {
            throw ValidationException::withMessages([
                'items' => 'One or more products are no longer available.',
            ]);
        }

        $created = DB::transaction(function () use ($user, $quantities, $listings, $data) {
            $subtotal = $listings->sum(function (ProductListing $listing) use ($quantities) {
                return $this->listingPrice($listing) * $quantities[$listing->id];
            });
            $tax = round($subtotal * 0.08, 2);
            $total = round($subtotal + $tax, 2);

            $order = Order::create([
                'customer_id' => $user->id,
                'subtotal' => $subtotal,
                'discount' => 0,
                'total' => $total,
                'status' => 'processing',
            ]);

            foreach ($listings as $listing) {
                $quantity = $quantities[$listing->id];
                $unitPrice = $this->listingPrice($listing);

                $order->items()->create([
                    'product_id' => $listing->product_id,
                    'product_listing_id' => $listing->id,
                    'product_name_snapshot' => $listing->title,
                    'unit_price_snapshot' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal_snapshot' => round($unitPrice * $quantity, 2),
                    'cost_snapshot' => $listing->product?->cost,
                    'metadata_snapshot' => [
                        'sku' => $listing->product?->sku,
                        'brand' => $listing->product?->brand,
                        'category' => $listing->product?->category,
                        'featured_image' => $listing->featured_image,
                    ],
                ]);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => $data['payment_method'] ?? 'card',
                'provider' => 'Simulated Checkout',
                'reference_number' => 'SIM-' . now()->format('YmdHis') . '-' . $order->id,
                'amount' => $total,
                'status' => 'paid',
                'paid_at' => now(),
                'metadata' => [
                    'mode' => 'simulated',
                    'tax' => $tax,
                    'authorized_by' => 'checkout-ui',
                ],
            ]);

            return [$order->load('items'), $payment];
        });

        [$order, $payment] = $created;

        return response()->json([
            'order' => [
                'id' => $order->id,
                'number' => sprintf('NV-%05d', $order->id),
                'status' => $order->status,
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount,
                'total' => (float) $order->total,
                'items_count' => $order->items->sum('quantity'),
            ],
            'payment' => [
                'id' => $payment->id,
                'reference_number' => $payment->reference_number,
                'status' => $payment->status,
                'amount' => (float) $payment->amount,
            ],
        ], 201);
    }

    private function listingPrice(ProductListing $listing): float
    {
        $salePrice = (float) $listing->sale_price;

        if ($salePrice > 0) {
            return $salePrice;
        }

        return (float) $listing->selling_price;
    }
}
