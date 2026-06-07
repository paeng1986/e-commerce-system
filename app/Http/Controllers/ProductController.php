<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\ProductService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{

    protected ProductService $service;

    public function __construct(ProductService $service) {
        $this->service = $service;
    }
    
    public function store(Request $request) {

        return $this->service->store($request->all());
        
    }

    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'sku',
            'name',
            'brand',
            'category',
            'specs',
            'price',
            'warranty',
            'stock'
        ];

        return response()->streamDownload(function () use ($headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            // optional sample row
            fputcsv($file, [
                'PRD-001',
                'Sample Product',
                'ASUS',
                'GPU',
                'GDDR6: 8GB | PCIe: 4.0',
                999.99,
                '1',
                10
            ]);

            fclose($file);
        }, 'product-template.csv');
    }

    public function bulkUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        return $this->service->bulkUpload($request);
    }

    public function adjustStock($id, Request $request)
    {
        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        try {
            $this->service->adjustStock($id, $data['stock']);

            return redirect()
                ->route('inventory')
                ->with('success', 'Stock updated successfully.');
        } catch (\Throwable $th) {
            \Log::error(
                'Stock Adjust Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors([
                'stock' => 'Failed to update stock.',
            ]);
        }
    }

}
