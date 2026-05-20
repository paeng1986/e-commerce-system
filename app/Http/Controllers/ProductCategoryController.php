<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\ProductCategoryService;

class ProductCategoryController extends Controller
{
    protected ProductCategoryService $service;

    public function __construct(ProductCategoryService $service) {
        $this->service = $service;
    }

    public function store(Request $request) {

        $request->validate([
            'title' => 'required|unique:product_categories,title'
        ]);

        return $this->service->store($request->all());

    }

    public function update($id, Request $request) {

        $request->validate([
            'title' => [
                'required',
                Rule::unique('product_categories', 'title')->ignore($id),
            ],
        ]);

        return $this->service->update($id, $request->all());

    }
}
