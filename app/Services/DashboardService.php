<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function __construct(private ProductService $products) {}

    /**
     * All data the admin dashboard needs, derived from live tables.
     */
    public function metrics(): array
    {
        return [
            'stats' => $this->stats(),
            'revenueTrend' => $this->revenueTrend(),
            'statusBreakdown' => $this->statusBreakdown(),
            'topSelling' => $this->topSelling(),
            'stockAlerts' => $this->stockAlerts(),
            'recentOrders' => $this->recentOrders(),
        ];
    }

    private function stats(): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $monthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonthNoOverflow()->endOfMonth();

        // Revenue excludes cancelled orders.
        $revenue = fn () => Order::query()->where('status', '!=', 'cancelled');

        $todaySales = (float) $revenue()->whereDate('created_at', $today)->sum('total');
        $yesterdaySales = (float) $revenue()->whereDate('created_at', $yesterday)->sum('total');
        $monthRevenue = (float) $revenue()->where('created_at', '>=', $monthStart)->sum('total');
        $lastMonthRevenue = (float) $revenue()
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');

        $inventory = $this->products->inventoryStats();

        return [
            'today_sales' => $todaySales,
            'today_sales_change' => $this->percentChange($todaySales, $yesterdaySales),
            'month_revenue' => $monthRevenue,
            'month_revenue_change' => $this->percentChange($monthRevenue, $lastMonthRevenue),
            'open_orders' => (int) Order::whereIn('status', ['pending', 'processing'])->count(),
            'assembling' => (int) Order::where('status', 'assembling')->count(),
            'low_stock' => (int) $inventory['low_stock'],
            'out_of_stock' => (int) $inventory['out_of_stock'],
            'total_orders' => (int) Order::count(),
            'total_customers' => (int) User::where('role', 'customer')->count(),
        ];
    }

    /**
     * Daily revenue for the last 7 days (oldest → newest), zero-filled.
     */
    private function revenueTrend(): array
    {
        $start = Carbon::today()->subDays(6);

        $totals = Order::query()
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day, SUM(total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $trend = [];

        for ($i = 0; $i < 7; $i++) {
            $date = (clone $start)->addDays($i);
            $key = $date->toDateString();

            $trend[] = [
                'date' => $date->format('M d'),
                'label' => $date->format('D'),
                'total' => (float) ($totals[$key] ?? 0),
            ];
        }

        return $trend;
    }

    /**
     * Order count per status, in pipeline order.
     */
    private function statusBreakdown(): array
    {
        $counts = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return collect(OrderService::STATUSES)
            ->map(fn ($status) => [
                'status' => ucwords($status),
                'count' => (int) ($counts[$status] ?? 0),
            ])
            ->all();
    }

    /**
     * Best-selling products by units sold (cancelled orders excluded).
     */
    private function topSelling(): array
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', 'cancelled')
            ->selectRaw('order_items.product_name_snapshot as name, SUM(order_items.quantity) as units')
            ->groupBy('order_items.product_name_snapshot')
            ->orderByDesc('units')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'units' => (int) $row->units,
            ])
            ->all();
    }

    /**
     * Products at or below the low-stock threshold, most urgent first.
     */
    private function stockAlerts(): array
    {
        $threshold = ProductService::LOW_STOCK_THRESHOLD;

        return Product::query()
            ->with('categories')
            ->where('stock', '<=', $threshold)
            ->orderBy('stock')
            ->limit(6)
            ->get()
            ->map(fn ($product) => [
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'stock' => (int) $product->stock,
                'critical' => $product->stock <= 3,
            ])
            ->all();
    }

    /**
     * The five most recent orders.
     */
    private function recentOrders(): array
    {
        return Order::query()
            ->with(['items', 'customer'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($order) => [
                'order_code' => '#ORD-000'.$order->id,
                'customer_name' => $order->customer?->name ?? 'Guest',
                'no_of_items' => $order->items->count(),
                'total' => (float) $order->total,
                'status' => ucwords($order->status),
            ])
            ->all();
    }

    private function percentChange(float $current, float $previous): ?float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
