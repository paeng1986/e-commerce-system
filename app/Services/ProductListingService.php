<?php

namespace App\Services;

use App\Models\ProductListing;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductListingService
{
    public function get()
    {

        return ProductListing::with('product')->get();

    }

    public function paginate(int $perPage = 25, ?string $search = null, ?string $category = null)
    {

        return ProductListing::query()
            ->with('product.categories')
            ->when($category && $category !== 'all', function ($query) use ($category) {
                $query->whereHas('product.categories', function ($productCategory) use ($category) {
                    $productCategory->where('title', $category);
                });
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($listingQuery) use ($search) {
                    $listingQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('seo_slug', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search) {
                            $productQuery
                                ->where('sku', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                                ->orWhere('brand', 'like', "%{$search}%")
                                ->orWhereHas('categories', function ($categoryQuery) use ($search) {
                                    $categoryQuery->where('title', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

    }

    public function store(array $data)
    {
        $featuredImages = collect($data['featured_image'] ?? [])
            ->filter()
            ->map(function ($image) {
                $filename = Str::uuid().'.'.$image->getClientOriginalExtension();

                Storage::disk('public')->putFileAs('images', $image, $filename);

                return '/images/'.$filename;
            })
            ->values()
            ->all();

        $listing = ProductListing::create([
            'product_id' => $data['product_id'],
            'title' => $data['title'],
            'selling_price' => $data['selling_price'],
            'sale_price' => $data['sale_price'] ?? 0,
            'description' => $data['description'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'featured_image' => $featuredImages,
            'seo_slug' => ($data['seo_slug'] ?? null) ?: Str::slug($data['title']),
        ]);

        return $listing;
    }
}
