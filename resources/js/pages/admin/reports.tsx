'use client';

import * as React from 'react';
import { usePage } from '@inertiajs/react';
import {
    Banknote,
    PackageCheck,
    Receipt,
    ShoppingCart,
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
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type Summary = {
    today_sales: number;
    month_sales: number;
    total_sales: number;
    total_orders: number;
    paid_amount: number;
    avg_order_value: number;
};

type StatusCount = { status: string; count: number };
type DailyPoint = { date: string; label: string; total: number; orders: number };
type TopProduct = { name: string; units: number; revenue: number };
type Fulfillment = {
    open: number;
    ready: number;
    delivered: number;
    cancelled: number;
};

type PageProps = {
    summary: Summary;
    statusBreakdown: StatusCount[];
    dailySales: DailyPoint[];
    topProducts: TopProduct[];
    fulfillment: Fulfillment;
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

const STATUS_BADGE: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    Processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    Assembling: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    Ready: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
    label,
    value,
    icon: Icon,
    hint,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    hint?: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between p-5">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-2 text-2xl font-bold">{value}</div>
                    {hint && (
                        <div className="mt-1 text-xs text-muted-foreground">
                            {hint}
                        </div>
                    )}
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
    );
}

function DailySalesChart({ data }: { data: DailyPoint[] }) {
    const max = Math.max(1, ...data.map((d) => d.total));
    const hasData = data.some((d) => d.total > 0);

    return (
        <div>
            <div className="flex h-48 items-end gap-2">
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
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                    title={`${point.date}: ${formatCurrency(point.total)} · ${point.orders} order(s)`}
                                />
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium">
                                    {point.label}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {point.date}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {!hasData && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    No sales recorded in the last 7 days.
                </p>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Reports() {
    const { summary, statusBreakdown, dailySales, topProducts, fulfillment } =
        usePage<PageProps>().props;

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                {/* HEADER */}
                <header className="flex h-16 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Back Office
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Reports</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-6 p-4">
                    {/* SUMMARY */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Sales today"
                            value={formatCurrency(summary?.today_sales ?? 0)}
                            icon={Banknote}
                        />
                        <StatCard
                            label="Sales this month"
                            value={formatCurrency(summary?.month_sales ?? 0)}
                            icon={ShoppingCart}
                        />
                        <StatCard
                            label="Total sales"
                            value={formatCurrency(summary?.total_sales ?? 0)}
                            icon={Receipt}
                            hint={`${formatNumber(summary?.total_orders ?? 0)} orders`}
                        />
                        <StatCard
                            label="Avg. order value"
                            value={formatCurrency(summary?.avg_order_value ?? 0)}
                            icon={PackageCheck}
                            hint={`${formatCurrency(summary?.paid_amount ?? 0)} collected`}
                        />
                    </div>

                    {/* DAILY SALES + STATUS */}
                    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales — last 7 days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DailySalesChart data={dailySales ?? []} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Orders by status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(statusBreakdown ?? []).map((s) => (
                                    <div
                                        key={s.status}
                                        className="flex items-center justify-between"
                                    >
                                        <Badge
                                            variant="outline"
                                            className={
                                                STATUS_BADGE[s.status] ?? ''
                                            }
                                        >
                                            {s.status}
                                        </Badge>
                                        <span className="text-sm font-medium">
                                            {formatNumber(s.count)}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* FULFILLMENT */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Open / in progress"
                            value={formatNumber(fulfillment?.open ?? 0)}
                            icon={ShoppingCart}
                        />
                        <StatCard
                            label="Ready for pickup/ship"
                            value={formatNumber(fulfillment?.ready ?? 0)}
                            icon={PackageCheck}
                        />
                        <StatCard
                            label="Delivered"
                            value={formatNumber(fulfillment?.delivered ?? 0)}
                            icon={Receipt}
                        />
                        <StatCard
                            label="Cancelled"
                            value={formatNumber(fulfillment?.cancelled ?? 0)}
                            icon={ShoppingCart}
                        />
                    </div>

                    {/* TOP PRODUCTS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top-selling products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">
                                            Units sold
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Revenue
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.length ? (
                                        topProducts.map((p) => (
                                            <TableRow key={p.name}>
                                                <TableCell className="font-medium">
                                                    {p.name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatNumber(p.units)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(p.revenue)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No sales data yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
