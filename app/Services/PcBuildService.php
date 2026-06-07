<?php

namespace App\Services;

use App\Models\PcBuild;
use App\Models\PcBuildListing;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PcBuildService
{
    /**
     * Return every build with its component items and (optional) listing,
     * shaped for the admin PC Builder page.
     */
    public function get()
    {
        return PcBuild::query()
            ->with(['items.product', 'listing'])
            ->latest()
            ->get()
            ->map(fn (PcBuild $build) => $this->transform($build));
    }

    /**
     * Create a PC build together with its component items.
     *
     * Prices and specs are snapshotted from the source product on the server
     * so the saved build is not affected by later product/price edits.
     */
    public function store(array $data): PcBuild
    {
        return DB::transaction(function () use ($data) {
            $build = PcBuild::create([
                'customer_id' => $data['customer_id'] ?? null,
                'name' => $data['name'],
                'notes' => $data['notes'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'estimated_total_price' => 0,
            ]);

            $total = 0;

            foreach ($data['items'] as $item) {
                $product = Product::with('categories')->find($item['product_id']);

                if (! $product) {
                    continue;
                }

                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                $price = (float) $product->cost;
                $total += $price * $quantity;

                $build->items()->create([
                    'product_id' => $product->id,
                    'product_listing_id' => $item['product_listing_id'] ?? null,
                    'category_type' => $item['category_type'] ?? ($product->category ?: 'Other'),
                    'quantity' => $quantity,
                    'price_snapshot' => $price,
                    'spec_snapshot' => [
                        'sku' => $product->sku,
                        'name' => $product->name,
                        'brand' => $product->brand,
                        'specs' => $product->specs,
                    ],
                ]);
            }

            $build->update(['estimated_total_price' => $total]);

            return $build->load(['items.product', 'listing']);
        });
    }

    /**
     * Publish a build to the storefront by creating (or updating) its listing.
     * One listing per build — re-listing updates the existing row.
     */
    public function storeListing(array $data): PcBuildListing
    {
        return DB::transaction(function () use ($data) {
            $build = PcBuild::findOrFail($data['pc_build_id']);

            $listing = PcBuildListing::updateOrCreate(
                ['pc_build_id' => $build->id],
                [
                    'title' => $data['title'],
                    'slug' => ($data['slug'] ?? null) ?: Str::slug($data['title']).'-'.$build->id,
                    'description' => $data['description'] ?? null,
                    'selling_price' => $data['selling_price'],
                    'sale_price' => $data['sale_price'] ?? null,
                    'is_featured' => $data['is_featured'] ?? false,
                    'is_published' => $data['is_published'] ?? false,
                    'status' => $data['status'] ?? 'active',
                ]
            );

            $build->update([
                'status' => ($data['is_published'] ?? false) ? 'published' : 'listed',
            ]);

            return $listing;
        });
    }

    protected function transform(PcBuild $build): array
    {
        return [
            'id' => $build->id,
            'name' => $build->name,
            'notes' => $build->notes,
            'status' => $build->status,
            'estimated_total_price' => $build->estimated_total_price,
            'created_at' => $build->created_at?->toDateString(),
            'items' => $build->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'category_type' => $item->category_type,
                'quantity' => $item->quantity,
                'price_snapshot' => $item->price_snapshot,
                'spec_snapshot' => $item->spec_snapshot,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'brand' => $item->product->brand,
                    'sku' => $item->product->sku,
                ] : null,
            ])->values(),
            'listing' => $build->listing ? [
                'id' => $build->listing->id,
                'title' => $build->listing->title,
                'slug' => $build->listing->slug,
                'description' => $build->listing->description,
                'selling_price' => $build->listing->selling_price,
                'sale_price' => $build->listing->sale_price,
                'is_featured' => $build->listing->is_featured,
                'is_published' => $build->listing->is_published,
                'status' => $build->listing->status,
            ] : null,
        ];
    }
}
