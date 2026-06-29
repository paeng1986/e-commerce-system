<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PcBuildListing;
use App\Models\ProductListing;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request, NotificationService $notifications): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.listing_id' => ['required', 'integer'],
            'items.*.kind' => ['nullable', 'string', 'in:product,pc_build'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'payment_method' => ['nullable', 'string', 'in:cod,gcash,bank_transfer'],
        ]);

        $user = $request->user();

        if (! $user || $user->role !== 'customer') {
            throw ValidationException::withMessages([
                'checkout' => 'Please sign in with a customer account before placing an order.',
            ]);
        }

        $items = collect($data['items']);

        $productQty = $items
            ->filter(fn ($item) => ($item['kind'] ?? 'product') === 'product')
            ->groupBy('listing_id')
            ->map(fn ($group) => collect($group)->sum('quantity'));

        $buildQty = $items
            ->filter(fn ($item) => ($item['kind'] ?? 'product') === 'pc_build')
            ->groupBy('listing_id')
            ->map(fn ($group) => collect($group)->sum('quantity'));

        $productListings = ProductListing::query()
            ->with('product.categories')
            ->whereIn('id', $productQty->keys())
            ->where('is_published', true)
            ->get()
            ->keyBy('id');

        $buildListings = PcBuildListing::query()
            ->with('build')
            ->whereIn('id', $buildQty->keys())
            ->where('is_published', true)
            ->get()
            ->keyBy('id');

        if (
            $productListings->count() !== $productQty->count()
            || $buildListings->count() !== $buildQty->count()
        ) {
            throw ValidationException::withMessages([
                'items' => 'One or more products are no longer available.',
            ]);
        }

        $created = DB::transaction(function () use ($user, $productQty, $buildQty, $productListings, $buildListings, $data) {
            $subtotal = $productListings->sum(
                fn (ProductListing $listing) => $this->productPrice($listing) * $productQty[$listing->id]
            ) + $buildListings->sum(
                fn (PcBuildListing $listing) => $this->buildPrice($listing) * $buildQty[$listing->id]
            );

            $tax = round($subtotal * 0.08, 2);
            $total = round($subtotal + $tax, 2);

            $order = Order::create([
                'customer_id' => $user->id,
                'subtotal' => $subtotal,
                'discount' => 0,
                'total' => $total,
                'status' => 'processing',
            ]);

            foreach ($productListings as $listing) {
                $quantity = $productQty[$listing->id];
                $unitPrice = $this->productPrice($listing);

                $order->items()->create([
                    'product_id' => $listing->product_id,
                    'product_listing_id' => $listing->id,
                    'product_name_snapshot' => $listing->title,
                    'unit_price_snapshot' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal_snapshot' => round($unitPrice * $quantity, 2),
                    'cost_snapshot' => $listing->product?->cost,
                    'metadata_snapshot' => [
                        'kind' => 'product',
                        'sku' => $listing->product?->sku,
                        'brand' => $listing->product?->brand,
                        'category' => $listing->product?->category,
                        'featured_image' => $listing->featured_image,
                    ],
                ]);
            }

            foreach ($buildListings as $listing) {
                $quantity = $buildQty[$listing->id];
                $unitPrice = $this->buildPrice($listing);

                $order->items()->create([
                    'product_id' => null,
                    'product_listing_id' => null,
                    'product_name_snapshot' => $listing->title,
                    'unit_price_snapshot' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal_snapshot' => round($unitPrice * $quantity, 2),
                    'cost_snapshot' => null,
                    'metadata_snapshot' => [
                        'kind' => 'pc_build',
                        'pc_build_listing_id' => $listing->id,
                        'pc_build_id' => $listing->pc_build_id,
                        'category' => 'PC Builds',
                    ],
                ]);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => $data['payment_method'] ?? 'cod',
                'provider' => 'Manual Checkout',
                'reference_number' => 'SIM-'.now()->format('YmdHis').'-'.$order->id,
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
        $notifications->notifyOrderConfirmed($order);

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

    private function productPrice(ProductListing $listing): float
    {
        $salePrice = (float) $listing->sale_price;

        return $salePrice > 0 ? $salePrice : (float) $listing->selling_price;
    }

    private function buildPrice(PcBuildListing $listing): float
    {
        $salePrice = (float) $listing->sale_price;

        return $salePrice > 0 ? $salePrice : (float) $listing->selling_price;
    }
}
