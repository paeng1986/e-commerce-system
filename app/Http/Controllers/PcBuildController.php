<?php

namespace App\Http\Controllers;

use App\Services\PcBuildService;
use Illuminate\Http\Request;

class PcBuildController extends Controller
{
    protected PcBuildService $service;

    public function __construct(PcBuildService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.category_type' => ['nullable', 'string', 'max:100'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        try {
            $this->service->store($data);

            return redirect()
                ->route('pc_builder')
                ->with('success', 'PC build saved successfully.');
        } catch (\Throwable $th) {
            \Log::error(
                'PC Build Store Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors([
                'build' => 'Failed to save PC build.',
            ]);
        }
    }

    public function storeListing(Request $request)
    {
        $data = $request->validate([
            'pc_build_id' => ['required', 'exists:pc_builds,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['boolean'],
            'is_published' => ['boolean'],
        ]);

        try {
            $this->service->storeListing($data);

            return redirect()
                ->route('pc_builder')
                ->with('success', 'PC build listed successfully.');
        } catch (\Throwable $th) {
            \Log::error(
                'PC Build Listing Store Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors([
                'listing' => 'Failed to list PC build.',
            ]);
        }
    }
}
