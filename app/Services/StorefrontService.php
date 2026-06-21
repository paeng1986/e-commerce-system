<?php

namespace App\Services;

use App\Models\PcBuildListing;
use App\Models\ProductListing;
use Illuminate\Support\Collection;

class StorefrontService
{
    /** Offset applied to PC build listing ids so they never collide with product listing ids on the client. */
    public const PC_BUILD_ID_OFFSET = 1000000;

    /**
     * Published product listings + published PC build listings, in one
     * uniform shape the storefront can render and check out.
     */
    public function publishedListings(): array
    {
        return $this->productListings()
            ->concat($this->pcBuildListings())
            ->values()
            ->all();
    }

    private function productListings(): Collection
    {
        return ProductListing::query()
            ->with('product.categories')
            ->where('is_published', true)
            ->latest()
            ->get()
            ->map(fn (ProductListing $listing) => [
                'id' => $listing->id,
                'kind' => 'product',
                'source_id' => $listing->id,
                'title' => $listing->title,
                'selling_price' => $listing->selling_price,
                'sale_price' => $listing->sale_price,
                'description' => $listing->description,
                'is_published' => true,
                'featured_image' => $listing->featured_image,
                'seo_slug' => $listing->seo_slug,
                'product' => $listing->product ? [
                    'id' => $listing->product->id,
                    'sku' => $listing->product->sku,
                    'name' => $listing->product->name,
                    'brand' => $listing->product->brand,
                    'specs' => $listing->product->specs,
                    'stock' => $listing->product->stock,
                    'category' => $listing->product->category,
                ] : null,
            ]);
    }

    private function pcBuildListings(): Collection
    {
        return PcBuildListing::query()
            ->with('build.items.product')
            ->where('is_published', true)
            ->latest()
            ->get()
            ->map(function (PcBuildListing $listing) {
                $build = $listing->build;
                $items = $build?->items ?? collect();

                $specs = $items
                    ->mapWithKeys(fn ($item) => [
                        $item->category_type => trim(
                            ($item->spec_snapshot['brand'] ?? '').' '.
                            ($item->spec_snapshot['name'] ?? $item->product?->name ?? '')
                        ),
                    ])
                    ->all();

                // How many full builds can be assembled from current component stock.
                $buildable = $items->isEmpty()
                    ? 0
                    : (int) $items->min(fn ($item) => $item->product
                        ? intdiv((int) $item->product->stock, max(1, (int) $item->quantity))
                        : 0);

                return [
                    'id' => self::PC_BUILD_ID_OFFSET + $listing->id,
                    'kind' => 'pc_build',
                    'source_id' => $listing->id,
                    'title' => $listing->title,
                    'selling_price' => $listing->selling_price,
                    'sale_price' => $listing->sale_price,
                    'description' => $listing->description,
                    'is_published' => true,
                    'featured_image' => null,
                    'seo_slug' => $listing->slug,
                    'product' => [
                        'id' => null,
                        'sku' => null,
                        'name' => $build?->name ?? $listing->title,
                        'brand' => 'Custom PC Build',
                        'specs' => json_encode((object) $specs),
                        'stock' => $buildable,
                        'category' => 'PC Builds',
                    ],
                ];
            });
    }
}
