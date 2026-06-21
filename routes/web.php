<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\CustomerAuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\PcBuildController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductListingController;
use App\Services\StorefrontService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$publishedListings = fn () => app(StorefrontService::class)->publishedListings();

Route::get('/', fn () => Inertia::render('storefront/landing', [
    'listings' => $publishedListings(),
]))->name('home');

Route::get('/shop', function () use ($publishedListings) {
    return Inertia::render('storefront/browse', [
        'listings' => $publishedListings(),
    ]);
})->name('storefront.shop');
Route::get('/products/{productId?}', function (?string $productId = null) use ($publishedListings) {
    return Inertia::render('storefront/product', [
        'productId' => $productId,
        'listings' => $publishedListings(),
    ]);
})->name('storefront.product');
Route::get('/wishlist', fn () => Inertia::render('storefront/wishlist', [
    'listings' => $publishedListings(),
]))->name('storefront.wishlist');
Route::get('/checkout', fn () => Inertia::render('storefront/checkout', [
    'listings' => $publishedListings(),
]))->name('storefront.checkout');
Route::post('/checkout/orders', [CheckoutController::class, 'store'])
    ->middleware('auth')
    ->name('storefront.checkout.orders.store');

Route::middleware('guest')->group(function () use ($publishedListings) {
    Route::get('/account/login', fn () => Inertia::render('storefront/login', [
        'listings' => $publishedListings(),
    ]))->name('storefront.login');
    Route::post('/account/login', [LoginController::class, 'store'])->name('storefront.login.store');
    Route::get('/account/register', fn () => Inertia::render('storefront/register', [
        'listings' => $publishedListings(),
    ]))->name('storefront.register');
    Route::post('/account/register', [CustomerAuthController::class, 'store'])->name('storefront.register.store');
});

Route::get('/account', fn () => Inertia::render('storefront/portal', [
    'listings' => $publishedListings(),
]))
    ->middleware('auth')
    ->name('storefront.portal');

Route::controller(LoginController::class)
    ->middleware('guest')
    ->group(function () {

        Route::get('/login', 'index')->name('login');
        Route::post('/login', 'store');

    });

Route::controller(AdminController::class)
    ->middleware('guest')
    ->prefix('admin')
    ->group(function () {
        Route::get('/', 'index')->name('admin');
    });

Route::controller(AdminController::class)
    ->middleware(['auth','admin'])
    ->prefix('admin')
    ->group(function () {

        Route::get('/dashboard', 'dashboard')->name('dashboard');
        Route::get('/customers', 'customers')->name('customers');
        Route::get('/categories', 'categories')->name('categories');
        Route::get('/orders', 'orders')->name('orders');
        Route::put('/orders/{order}/status', 'updateOrderStatus')->name('orders.status.update');
        Route::get('/payments-and-billing', 'payments_billing')->name('payments-and-billing');
        Route::get('/inventory', 'inventory')->name('inventory');
        Route::get('/products', 'products')->name('products');
        Route::get('/listings', 'listings')->name('listings');
        Route::get('/listing/{id}', 'listing')->name('listing');
        Route::get('/pc-builder', 'pc_builder')->name('pc_builder');

    });

Route::controller(ProductCategoryController::class)
    ->middleware(['auth','admin'])
    ->prefix('admin')
    ->group(function () {

        Route::post('/categories', 'store');
        Route::put('/categories/{id}', 'update');

    });

Route::controller(ProductController::class)
    ->middleware(['auth','admin'])
    ->prefix('admin')
    ->group(function () {

        Route::get('/products/template', 'downloadTemplate');
        Route::post('/product', 'store');
        Route::put('/product/{id}', 'update');
        Route::put('/inventory/{id}/stock', 'adjustStock')->name('inventory.stock.update');

        Route::post('/products/bulk-upload', 'bulkUpload');

    });

Route::controller(ProductListingController::class)
    ->middleware(['auth','admin'])
    ->prefix('admin')
    ->group(function () {

        Route::post('/listing', 'store')->name('listing.store');

    });

Route::controller(PcBuildController::class)
    ->middleware(['auth','admin'])
    ->prefix('admin')
    ->group(function () {

        Route::post('/pc-build', 'store')->name('pc-build.store');
        Route::post('/pc-build-listing', 'storeListing')->name('pc-build-listing.store');

    });

Route::controller(CustomerController::class)
    ->middleware(['auth','admin'])
    ->prefix('admin')
    ->group(function () {

        Route::post('/customer', 'store')->name('customer.store');

    });

Route::post('/logout', [LoginController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
