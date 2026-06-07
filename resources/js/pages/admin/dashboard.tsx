'use client';

import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Boxes,
    ClipboardList,
    ShoppingCart,
    Wallet,
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type Stats = {
    today_sales: number;
    today_sales_change: number | null;
    month_revenue: number;
    month_revenue_change: number | null;
    open_orders: number;
    assembling: number;
    low_stock: number;
    out_of_stock: number;
    total_orders: number;
    total_customers: number;
};

type TrendPoint = { date: string; label: string; total: number };
type StatusCount = { status: string; count: number };
type TopItem = { name: string; units: number };
type StockAlert = {
    name: string;
    sku: string;
    category: { title: string } | string | null;
    stock: number;
    critical: boolean;
};
type RecentOrder = {
    order_code: string;
    customer_name: string;
    no_of_items: number;
    total: number;
    status: string;
};

type PageProps = {
    stats: Stats;
    revenueTrend: TrendPoint[];
    statusBreakdown: StatusCount[];
    topSelling: TopItem[];
    stockAlerts: StockAlert[];
    recentOrders: RecentOrder[];
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH').format(value || 0);
}

function categoryLabel(category: StockAlert['category']): string {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    return category.title ?? 'Uncategorized';
}

const STATUS_BADGE: Record<string, string> = {
    Pending:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    Processing:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    Assembling:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    Ready: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Delivered:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function DashboardCard({
    title,
    action,
    children,
    className,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={`rounded-2xl shadow-sm ${className ?? ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">{title}</CardTitle>
                {action}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function StatCard({
    title,
    value,
    change,
    icon: Icon,
    hint,
    danger,
}: {
    title: string;
    value: string;
    change?: number | null;
    icon: React.ElementType;
    hint?: string;
    danger?: boolean;
}) {
    const hasChange = change !== undefined && change !== null;
    const up = (change ?? 0) >= 0;

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {title}
                    </span>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                <div
                    className={`mt-2 text-3xl font-bold ${danger ? 'text-red-500' : ''}`}
                >
                    {value}
                </div>

                {hasChange ? (
                    <div
                        className={`mt-1 flex items-center gap-1 text-sm ${
                            up ? 'text-green-500' : 'text-red-500'
                        }`}
                    >
                        {up ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                        )}
                        {Math.abs(change as number)}% vs{' '}
                        {title === "Today's sales" ? 'yesterday' : 'last month'}
                    </div>
                ) : (
                    hint && (
                        <div
                            className={`mt-1 text-sm ${danger ? 'text-red-500' : 'text-muted-foreground'}`}
                        >
                            {hint}
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge className={STATUS_BADGE[status] ?? ''} variant="outline">
            {status}
        </Badge>
    );
}

/* -------------------------------------------------------------------------- */
/*                              REVENUE TREND CHART                           */
/* -------------------------------------------------------------------------- */

function RevenueTrend({ data }: { data: TrendPoint[] }) {
    const max = Math.max(1, ...data.map((d) => d.total));
    const hasRevenue = data.some((d) => d.total > 0);

    return (
        <div>
            <div className="flex h-44 items-end gap-2">
                {data.map((point) => {
                    const height = Math.round((point.total / max) * 100);
                    return (
                        <div
                            key={point.date}
                            className="flex flex-1 flex-col items-center gap-2"
                        >
                            <div className="flex w-full flex-1 items-end">
                                <div
                                    className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                                    style={{
                                        height: `${Math.max(height, 2)}%`,
                                    }}
                                    title={`${point.date}: ${formatCurrency(point.total)}`}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {point.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {!hasRevenue && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    No revenue recorded in the last 7 days.
                </p>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
    const {
        stats,
        revenueTrend,
        statusBreakdown,
        topSelling,
        stockAlerts,
        recentOrders,
    } = usePage<PageProps>().props;

    const maxUnits = Math.max(1, ...topSelling.map((t) => t.units));
    const totalOrdersInPipeline = statusBreakdown.reduce(
        (sum, s) => sum + s.count,
        0,
    );

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                {/* HEADER */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Admin Portal
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-4">
                    {/* STATS */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Today's sales"
                            value={formatCurrency(stats.today_sales)}
                            change={stats.today_sales_change}
                            icon={Wallet}
                            hint="No sales yet today"
                        />
                        <StatCard
                            title="Monthly revenue"
                            value={formatCurrency(stats.month_revenue)}
                            change={stats.month_revenue_change}
                            icon={ShoppingCart}
                            hint="No revenue yet this month"
                        />
                        <StatCard
                            title="Open orders"
                            value={formatNumber(stats.open_orders)}
                            icon={ClipboardList}
                            hint={`${formatNumber(stats.assembling)} assembling now`}
                        />
                        <StatCard
                            title="Low stock alerts"
                            value={formatNumber(stats.low_stock)}
                            icon={Boxes}
                            danger={stats.out_of_stock > 0}
                            hint={`${formatNumber(stats.out_of_stock)} out of stock`}
                        />
                    </div>

                    {/* REVENUE + PIPELINE */}
                    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                        <DashboardCard title="Revenue — last 7 days">
                            <RevenueTrend data={revenueTrend} />
                        </DashboardCard>

                        <DashboardCard title="Order pipeline">
                            {totalOrdersInPipeline === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No orders yet.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {statusBreakdown.map((s) => (
                                        <div
                                            key={s.status}
                                            className="flex items-center justify-between"
                                        >
                                            <StatusBadge status={s.status} />
                                            <span className="text-sm font-medium">
                                                {formatNumber(s.count)}
                                            </span>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Total orders
                                        </span>
                                        <span className="font-semibold">
                                            {formatNumber(stats.total_orders)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </DashboardCard>
                    </div>

                    {/* TOP SELLING + STOCK ALERTS */}
                    <div className="grid gap-6 xl:grid-cols-2">
                        <DashboardCard
                            title="Top-selling components"
                            action={
                                <button
                                    onClick={() =>
                                        router.visit('/admin/products')
                                    }
                                    className="text-sm text-primary hover:underline"
                                >
                                    View catalog →
                                </button>
                            }
                        >
                            {topSelling.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No sales data yet.
                                </p>
                            ) : (
                                <div className="space-y-5">
                                    {topSelling.map((item) => (
                                        <div
                                            key={item.name}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="truncate pr-3">
                                                    {item.name}
                                                </span>
                                                <span className="shrink-0 text-muted-foreground">
                                                    {item.units} units
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    (item.units / maxUnits) * 100
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DashboardCard>

                        <DashboardCard
                            title="Critical stock alerts"
                            action={
                                <button
                                    onClick={() =>
                                        router.visit('/admin/inventory')
                                    }
                                    className="text-sm text-primary hover:underline"
                                >
                                    Manage stock →
                                </button>
                            }
                        >
                            {stockAlerts.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    All products are well stocked.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {stockAlerts.map((item) => (
                                        <div
                                            key={item.sku}
                                            className="flex items-start justify-between rounded-xl border p-4"
                                        >
                                            <div className="flex gap-3">
                                                {item.critical ? (
                                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                                                ) : (
                                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {categoryLabel(
                                                            item.category,
                                                        )}{' '}
                                                        · {item.sku}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`text-sm font-medium ${item.critical ? 'text-red-500' : ''}`}
                                            >
                                                {item.stock} left
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DashboardCard>
                    </div>

                    {/* RECENT ORDERS */}
                    <DashboardCard
                        title="Recent orders"
                        action={
                            <button
                                onClick={() => router.visit('/admin/orders')}
                                className="text-sm text-primary hover:underline"
                            >
                                All orders →
                            </button>
                        }
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.length ? (
                                    recentOrders.map((order) => (
                                        <TableRow key={order.order_code}>
                                            <TableCell className="font-medium">
                                                {order.order_code}
                                            </TableCell>
                                            <TableCell>
                                                {order.customer_name}
                                            </TableCell>
                                            <TableCell>
                                                {order.no_of_items}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(order.total)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No orders yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DashboardCard>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
