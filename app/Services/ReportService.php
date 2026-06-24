<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Carbon;

class ReportService
{
    /**
     * Operational + sales reporting used by the Staff and Admin Reports page.
     */
    public function generate(): array
    {
        return [
            'summary' => $this->summary(),
            'statusBreakdown' => $this->statusBreakdown(),
            'dailySales' => $this->dailySales(),
            'topProducts' => $this->topProducts(),
            'fulfillment' => $this->fulfillment(),
        ];
    }

    private function summary(): array
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $revenue = fn () => Order::query()->where('status', '!=', 'cancelled');

        return [
            'today_sales' => (float) (clone $revenue())->whereDate('created_at', $today)->sum('total'),
            'month_sales' => (float) (clone $revenue())->where('created_at', '>=', $monthStart)->sum('total'),
            'total_sales' => (float) (clone $revenue())->sum('total'),
            'total_orders' => (int) Order::count(),
            'paid_amount' => (float) Payment::where('status', 'paid')->sum('amount'),
            'avg_order_value' => (float) (clone $revenue())->avg('total'),
        ];
    }

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
     * Revenue + order count per day for the last 7 days (oldest → newest).
     */
    private function dailySales(): array
    {
        $start = Carbon::today()->subDays(6);

        $rows = Order::query()
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day, SUM(total) as total, COUNT(*) as orders')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $series = [];

        for ($i = 0; $i < 7; $i++) {
            $date = (clone $start)->addDays($i);
            $key = $date->toDateString();
            $row = $rows->get($key);

            $series[] = [
                'date' => $date->format('M d'),
                'label' => $date->format('D'),
                'total' => (float) ($row->total ?? 0),
                'orders' => (int) ($row->orders ?? 0),
            ];
        }

        return $series;
    }

    private function topProducts(): array
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', 'cancelled')
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

    /**
     * Fulfillment snapshot: how many orders are still open vs completed.
     */
    private function fulfillment(): array
    {
        $open = (int) Order::whereIn('status', ['pending', 'processing', 'assembling'])->count();
        $ready = (int) Order::where('status', 'ready')->count();
        $delivered = (int) Order::where('status', 'delivered')->count();
        $cancelled = (int) Order::where('status', 'cancelled')->count();

        return [
            'open' => $open,
            'ready' => $ready,
            'delivered' => $delivered,
            'cancelled' => $cancelled,
        ];
    }
}
