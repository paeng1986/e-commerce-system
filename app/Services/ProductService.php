<?php

namespace App\Services;

use App\Models\{Product, ProductCategory};

class ProductService
{
    public function get()
    {
        return Product::with('categories')->get()->map(function ($item) {

            return [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'brand' => $item->brand,
                'specs' => $item->specs,
                'cost' => $item->cost,
                'warranty' => $item->warranty,
                'stock' => $item->stock,
                'category' => $item->category,
            ];
        });
    }

    public function paginate(int $perPage = 25, ?string $search = null, ?string $category = null, string $pageName = 'page')
    {
        return Product::query()
            ->with('categories')
            ->when($category && $category !== 'all', function ($query) use ($category) {
                $query->whereHas('categories', function ($productCategory) use ($category) {
                    $productCategory->where('title', $category);
                });
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($productQuery) use ($search) {
                    $productQuery
                        ->where('sku', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('specs', 'like', "%{$search}%")
                        ->orWhereHas('categories', function ($categoryQuery) use ($search) {
                            $categoryQuery->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate($perPage, ['*'], $pageName)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'sku' => $item->sku,
                    'name' => $item->name,
                    'brand' => $item->brand,
                    'specs' => $item->specs,
                    'cost' => $item->cost,
                    'warranty' => $item->warranty,
                    'stock' => $item->stock,
                    'category' => $item->category,
                ];
            });
    }

    public function show($id)
    {
        return Product::find($id);
    }

    public function store(array $data)
    {

        try {

            Product::create($data);

            return back();

        } catch (\Throwable $th) {

            \Log::error(
                'Product Store Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors('Has errors');
        }

    }

    public function update($id, array $data) {}

    public function destroy($id) {}

    public function bulkUpload($request)
    {

        try {

            $file = fopen($request->file('file')->getRealPath(), 'r');

            $header = fgetcsv($file); // skip header

            while ($row = fgetcsv($file)) {

                [$sku, $name, $brand, $categoryName, $specs, $cost, $warranty, $stock] = $row;

                $category = ProductCategory::firstOrCreate([
                    'title' => $categoryName,
                ]);

                Product::create([
                    'sku' => $sku,
                    'name' => $name,
                    'brand' => $brand,
                    'product_category_id' => $category->id,
                    'specs' => $specs,
                    'cost' => $cost,
                    'warranty' => $warranty,
                    'stock' => $stock,
                ]);
            }

            fclose($file);

            return back()->with('success', 'Products uploaded successfully');

        } catch (\Throwable $th) {

            \Log::error(
                'Product Bulk Upload Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors('Has errors');
        }

    }
}
