<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use App\Services\PaymentBillingService;
use App\Services\ProductCategoryService;
use App\Services\ProductListingService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('auth/admin_login');
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('admin/dashboard');
    }

    public function inventory(Request $request)
    {
        return Inertia::render('admin/inventory');
    }

    public function customers(Request $request)
    {
        return Inertia::render('admin/customers');
    }

    public function categories(Request $request, ProductCategoryService $service)
    {
        $categories = $service->get();

        return Inertia::render('admin/categories', compact('categories'));
    }

    public function orders(Request $request, OrderService $order)
    {

        $perPage = $request->integer('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $orders = $order->paginate(
            $perPage,
            $search ?: null,
            $status ?: null,
        );

        return Inertia::render('admin/orders', compact('orders'));
    }

    public function updateOrderStatus(Request $request, OrderService $orderService, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', OrderService::STATUSES)],
        ]);

        $orderService->updateStatus($order, $data['status']);

        return back()->with('success', 'Order status updated.');
    }

    public function payments_billing(Request $request, PaymentBillingService $payment)
    {
        $perPage = $request->integer('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;
        $search = $request->string('search')->trim()->toString();

        $payments = $payment->paginate(
            $perPage,
            $search ?: null,
        );

        return Inertia::render('admin/payments_billing', compact('payments'));
    }

    public function products(
        Request $request,
        ProductCategoryService $category,
        ProductService $product
    ) {
        $perPage = $request->integer('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;
        $search = $request->string('search')->trim()->toString();
        $productCategory = $request->string('category', 'all')->trim()->toString();

        $products = $product->paginate(
            $perPage,
            $search ?: null,
            $productCategory ?: 'all'
        );
        $categories = $category->get();

        return Inertia::render('admin/products', compact('products', 'categories'));
    }

    public function listings(
        Request $request,
        ProductCategoryService $categoryService,
        ProductService $product,
        ProductListingService $listing
    ) {
        $perPage = $request->integer('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;
        $search = $request->string('search')->trim()->toString();
        $listingCategory = $request->string('category', 'all')->trim()->toString();
        $productPerPage = $request->integer('product_per_page', 25);
        $productPerPage = in_array($productPerPage, [10, 25, 50, 100], true) ? $productPerPage : 25;
        $productSearch = $request->string('product_search')->trim()->toString();
        $productCategory = $request->string('product_category', 'all')->trim()->toString();

        $categories = $categoryService->options();
        $products = $product->paginate(
            $productPerPage,
            $productSearch ?: null,
            $productCategory ?: 'all',
            'product_page'
        );
        $listings = $listing->paginate(
            $perPage,
            $search ?: null,
            $listingCategory ?: 'all'
        );

        return Inertia::render('admin/listings', compact('categories', 'products', 'listings'));
    }

    public function listing($id, Request $request, ProductService $product)
    {
        $product = $product->show($id);

        abort_unless($product, 404);

        return Inertia::render('admin/listing', compact('product'));
    }

    public function pc_builder(
        Request $request, 
        ProductService $product
    )
    {
        $products = $product->get();
        return Inertia::render('admin/pc_builder', compact('products'));
    }
}
