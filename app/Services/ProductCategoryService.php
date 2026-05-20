<?php

namespace App\Services;

use App\Models\ProductCategory;

class ProductCategoryService
{
    public function get()
    {

        return ProductCategory::with('product')->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'title' => $category->title,
                'description' => $category->description,
                'count' => $category?->product?->count() ?? 0,
            ];
        });

    }

    public function options()
    {

        return ProductCategory::query()
            ->orderBy('title')
            ->get(['id', 'title']);

    }

    public function store(array $data)
    {

        try {

            ProductCategory::create($data);

            return back();

        } catch (\Throwable $th) {

            \Log::error(
                'Category Store Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors('Has errors');
        }

    }

    public function update($id, array $data)
    {

        try {

            ProductCategory::find($id)->update($data);

            return back();

        } catch (\Throwable $th) {

            \Log::error(
                'Category Update Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors('Has errors');
        }

    }
}
