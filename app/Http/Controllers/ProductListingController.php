<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ProductListingService;

class ProductListingController extends Controller
{
    protected ProductListingService $service;

    public function __construct(ProductListingService $service) {
        $this->service = $service;
    }

    public function store(Request $request) {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'title' => ['required', 'string', 'max:255'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'featured_image' => ['nullable', 'array'],
            'featured_image.*' => ['nullable', 'image', 'max:5120'],
            'seo_slug' => ['nullable', 'string', 'max:255', 'unique:product_listings,seo_slug'],
        ]);

        try {
            $this->service->store($data);

            return redirect()
                ->route('listings')
                ->with('success', 'Listing added to the listings.');
        } catch (\Throwable $th) {
            \Log::error(
                'Product Listing Store Error: ' .
                $th->getMessage() .
                "\n" .
                $th->getTraceAsString()
            );

            return back()->withErrors([
                'listing' => 'Failed to add listing.',
            ]);
        }
    }
}
