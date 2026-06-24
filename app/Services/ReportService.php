<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ReportService
{
    public const EXPORT_TYPES = [
        'sales',
        'customers',
        'inventory',
        'fulfillment',
    ];

    public function generate(array $filters = []): array
    {
        [$start, $end] = $this->dateRange($filters);

        return [
            'filters' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ],
            'summary' => $this->summary($start, $end),
            'statusBreakdown' => $this->statusBreakdown($start, $end),
            'dailySales' => $this->dailySales($start, $end),
            'topProducts' => $this->topProducts($start, $end),
            'salesRecords' => $this->salesRecords($start, $end),
            'customerReport' => $this->customerReport($start, $end),
            'inventoryReport' => $this->inventoryReport(),
            'fulfillment' => $this->fulfillment($start, $end),
            'fulfillmentRecords' => $this->fulfillmentRecords($start, $end),
        ];
    }

    public function export(string $type, array $filters = []): array
    {
        [$start, $end] = $this->dateRange($filters);

        return match ($type) {
            'sales' => [
                ['Order', 'Date', 'Customer', 'Items', 'Status', 'Payment Status', 'Payment Method', 'Subtotal', 'Discount', 'Total'],
                $this->salesRecords($start, $end, 1000),
            ],
            'customers' => [
                ['Customer', 'Email', 'Joined', 'Orders', 'Revenue', 'Last Order'],
                $this->customerRows($start, $end, 1000),
            ],
            'inventory' => [
                ['SKU', 'Product', 'Brand', 'Category', 'Stock', 'Cost', 'Stock Value', 'Status'],
                $this->inventoryRows(1000),
            ],
            'fulfillment' => [
                ['Order', 'Date', 'Customer', 'Items', 'Status', 'Age Days', 'Total'],
                $this->fulfillmentRecords($start, $end, 1000),
            ],
            default => [[], []],
        };
    }

    private function dateRange(array $filters): array
    {
        $end = $this->parseDate($filters['end_date'] ?? null) ?? Carbon::today();
        $start = $this->parseDate($filters['start_date'] ?? null) ?? (clone $end)->subDays(29);

        if ($start->gt($end)) {
            [$start, $end] = [$end, $start];
        }

        return [$start->startOfDay(), $end->endOfDay()];
    }

    private function parseDate(?string $value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function revenueOrders(Carbon $start, Carbon $end): Builder
    {
        return Order::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$start, $end]);
    }

    private function rangeOrders(Carbon $start, Carbon $end): Builder
    {
        return Order::query()->whereBetween('created_at', [$start, $end]);
    }

    private function summary(Carbon $start, Carbon $end): array
    {
        $revenue = $this->revenueOrders($start, $end);
        $orderIds = (clone $revenue)->pluck('id');

        return [
            'period_sales' => (float) (clone $revenue)->sum('total'),
            'period_orders' => (int) (clone $revenue)->count(),
            'units_sold' => (int) OrderItem::whereIn('order_id', $orderIds)->sum('quantity'),
            'avg_order_value' => (float) (clone $revenue)->avg('total'),
            'collected_amount' => (float) Payment::where('status', 'paid')
                ->whereBetween('created_at', [$start, $end])
                ->sum('amount'),
            'total_sales' => (float) Order::where('status', '!=', 'cancelled')->sum('total'),
            'total_orders' => (int) Order::count(),
        ];
    }

    private function statusBreakdown(Carbon $start, Carbon $end): array
    {
        $counts = $this->rangeOrders($start, $end)
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

    private function dailySales(Carbon $start, Carbon $end): array
    {
        $rows = $this->revenueOrders($start, $end)
            ->selectRaw('DATE(created_at) as day, SUM(total) as total, COUNT(*) as orders')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $series = [];
        $cursor = $start->copy()->startOfDay();
        $last = $end->copy()->startOfDay();

        while ($cursor->lte($last)) {
            $key = $cursor->toDateString();
            $row = $rows->get($key);

            $series[] = [
                'date' => $cursor->format('M d'),
                'label' => $cursor->format('M d'),
                'total' => (float) ($row->total ?? 0),
                'orders' => (int) ($row->orders ?? 0),
            ];

            $cursor->addDay();
        }

        return $series;
    }

    private function topProducts(Carbon $start, Carbon $end): array
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$start, $end])
            ->selectRaw('order_items.product_name_snapshot as name, SUM(order_items.quantity) as units, SUM(order_items.subtotal_snapshot) as revenue')
            ->groupBy('order_items.product_name_snapshot')
            ->orderByDesc('units')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'units' => (int) $row->units,
                'revenue' => (float) $row->revenue,
            ])
            ->all();
    }

    private function salesRecords(Carbon $start, Carbon $end, int $limit = 25): array
    {
        return $this->rangeOrders($start, $end)
            ->with(['customer.profile', 'items', 'payment'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($order) => [
                'order' => sprintf('#ORD-%05d', $order->id),
                'date' => $order->created_at?->format('Y-m-d'),
                'customer' => $order->customer?->name ?: 'Guest',
                'items' => (int) $order->items->sum('quantity'),
                'status' => ucwords($order->status),
                'payment_status' => ucwords($order->payment?->status ?? 'unpaid'),
                'payment_method' => strtoupper($order->payment?->method ?? 'N/A'),
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount,
                'total' => (float) $order->total,
            ])
            ->all();
    }

    private function customerReport(Carbon $start, Carbon $end): array
    {
        return [
            'total_customers' => (int) User::where('role', 'customer')->count(),
            'new_customers' => (int) User::where('role', 'customer')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'ordering_customers' => (int) $this->revenueOrders($start, $end)
                ->whereNotNull('customer_id')
                ->distinct('customer_id')
                ->count('customer_id'),
            'topCustomers' => $this->customerRows($start, $end, 10),
        ];
    }

    private function customerRows(Carbon $start, Carbon $end, int $limit): array
    {
        return User::query()
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->join('orders', 'orders.customer_id', '=', 'users.id')
            ->where('users.role', 'customer')
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$start, $end])
            ->selectRaw('
                users.id,
                users.email,
                users.created_at,
                user_profiles.first_name,
                user_profiles.last_name,
                COUNT(orders.id) as orders,
                SUM(orders.total) as revenue,
                MAX(orders.created_at) as last_order
            ')
            ->groupBy('users.id', 'users.email', 'users.created_at', 'user_profiles.first_name', 'user_profiles.last_name')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'customer' => trim("{$row->first_name} {$row->last_name}") ?: $row->email,
                'email' => $row->email,
                'joined' => Carbon::parse($row->created_at)->format('Y-m-d'),
                'orders' => (int) $row->orders,
                'revenue' => (float) $row->revenue,
                'last_order' => Carbon::parse($row->last_order)->format('Y-m-d'),
            ])
            ->all();
    }

    private function inventoryReport(): array
    {
        return [
            'summary' => [
                'total_skus' => (int) Product::count(),
                'total_units' => (int) Product::sum('stock'),
                'stock_value' => (float) Product::query()
                    ->selectRaw('COALESCE(SUM(cost * stock), 0) as value')
                    ->value('value'),
                'low_stock' => (int) Product::where('stock', '>', 0)
                    ->where('stock', '<=', ProductService::LOW_STOCK_THRESHOLD)
                    ->count(),
                'out_of_stock' => (int) Product::where('stock', '<=', 0)->count(),
            ],
            'categoryStock' => $this->categoryStock(),
            'stockAlerts' => $this->inventoryRows(15),
        ];
    }

    private function categoryStock(): array
    {
        return Product::query()
            ->leftJoin('product_categories', 'product_categories.id', '=', 'products.product_category_id')
            ->selectRaw("COALESCE(product_categories.title, 'Uncategorized') as category, COUNT(products.id) as skus, SUM(products.stock) as units, SUM(products.cost * products.stock) as value")
            ->groupBy('product_categories.title')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'skus' => (int) $row->skus,
                'units' => (int) $row->units,
                'value' => (float) $row->value,
            ])
            ->all();
    }

    private function inventoryRows(int $limit): array
    {
        return Product::query()
            ->with('categories')
            ->orderBy('stock')
            ->limit($limit)
            ->get()
            ->map(fn ($product) => [
                'sku' => $product->sku,
                'product' => $product->name,
                'brand' => $product->brand ?? 'N/A',
                'category' => $product->category ?: 'Uncategorized',
                'stock' => (int) $product->stock,
                'cost' => (float) $product->cost,
                'stock_value' => (float) $product->cost * (int) $product->stock,
                'status' => $this->stockStatus((int) $product->stock),
            ])
            ->all();
    }

    private function fulfillment(Carbon $start, Carbon $end): array
    {
        return [
            'open' => (int) $this->rangeOrders($start, $end)
                ->whereIn('status', ['pending', 'processing', 'assembling'])
                ->count(),
            'ready' => (int) $this->rangeOrders($start, $end)->where('status', 'ready')->count(),
            'delivered' => (int) $this->rangeOrders($start, $end)->where('status', 'delivered')->count(),
            'cancelled' => (int) $this->rangeOrders($start, $end)->where('status', 'cancelled')->count(),
        ];
    }

    private function fulfillmentRecords(Carbon $start, Carbon $end, int $limit = 25): array
    {
        return $this->rangeOrders($start, $end)
            ->with(['customer.profile', 'items'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($order) => [
                'order' => sprintf('#ORD-%05d', $order->id),
                'date' => $order->created_at?->format('Y-m-d'),
                'customer' => $order->customer?->name ?: 'Guest',
                'items' => (int) $order->items->sum('quantity'),
                'status' => ucwords($order->status),
                'age_days' => (int) $order->created_at->diffInDays(now()),
                'total' => (float) $order->total,
            ])
            ->all();
    }

    private function stockStatus(int $stock): string
    {
        if ($stock <= 0) {
            return 'Out of stock';
        }

        if ($stock <= ProductService::LOW_STOCK_THRESHOLD) {
            return 'Low stock';
        }

        return 'In stock';
    }
}
