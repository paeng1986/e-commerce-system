'use client';

import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Boxes,
    CalendarSearch,
    Download,
    PackageCheck,
    Receipt,
    ShoppingCart,
    Truck,
    Users,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';

type Summary = {
    period_sales: number;
    period_orders: number;
    units_sold: number;
    avg_order_value: number;
    collected_amount: number;
    total_sales: number;
    total_orders: number;
};

type Filters = { start_date: string; end_date: string };
type StatusCount = { status: string; count: number };
type DailyPoint = { date: string; label: string; total: number; orders: number };
type TopProduct = { name: string; units: number; revenue: number };
type SalesRecord = {
    order: string;
    date: string;
    customer: string;
    items: number;
    status: string;
    payment_status: string;
    payment_method: string;
    subtotal: number;
    discount: number;
    total: number;
};
type CustomerRow = {
    customer: string;
    email: string;
    joined: string;
    orders: number;
    revenue: number;
    last_order: string;
};
type CustomerReport = {
    total_customers: number;
    new_customers: number;
    ordering_customers: number;
    topCustomers: CustomerRow[];
};
type InventoryRow = {
    sku: string;
    product: string;
    brand: string;
    category: string;
    stock: number;
    cost: number;
    stock_value: number;
    status: string;
};
type CategoryStock = {
    category: string;
    skus: number;
    units: number;
    value: number;
};
type InventoryReport = {
    summary: {
        total_skus: number;
        total_units: number;
        stock_value: number;
        low_stock: number;
        out_of_stock: number;
    };
    categoryStock: CategoryStock[];
    stockAlerts: InventoryRow[];
};
type Fulfillment = {
    open: number;
    ready: number;
    delivered: number;
    cancelled: number;
};
type FulfillmentRecord = {
    order: string;
    date: string;
    customer: string;
    items: number;
    status: string;
    age_days: number;
    total: number;
};

type PageProps = {
    filters: Filters;
    summary: Summary;
    statusBreakdown: StatusCount[];
    dailySales: DailyPoint[];
    topProducts: TopProduct[];
    salesRecords: SalesRecord[];
    customerReport: CustomerReport;
    inventoryReport: InventoryReport;
    fulfillment: Fulfillment;
    fulfillmentRecords: FulfillmentRecord[];
};

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

const STOCK_BADGE: Record<string, string> = {
    'In stock': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    'Low stock': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    'Out of stock': 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

function exportUrl(type: string, filters: Filters): string {
    const params = new URLSearchParams(filters);
    return `/admin/reports/export/${type}?${params.toString()}`;
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge className={STATUS_BADGE[status] ?? ''} variant="outline">
            {status}
        </Badge>
    );
}

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
        <Card className="shadow-sm">
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

function ReportCard({
    title,
    exportType,
    filters,
    children,
}: {
    title: string;
    exportType?: string;
    filters: Filters;
    children: React.ReactNode;
}) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="text-lg">{title}</CardTitle>
                {exportType && (
                    <Button asChild variant="outline" size="sm">
                        <a href={exportUrl(exportType, filters)}>
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </Button>
                )}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function DailySalesChart({ data }: { data: DailyPoint[] }) {
    const max = Math.max(1, ...data.map((d) => d.total));
    const hasData = data.some((d) => d.total > 0);

    return (
        <div>
            <div className="overflow-x-auto pb-2">
                <div className="flex h-52 min-w-[720px] items-end gap-2">
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
                                        title={`${point.date}: ${formatCurrency(point.total)} / ${point.orders} orders`}
                                    />
                                </div>
                                <div className="text-center text-[11px] text-muted-foreground">
                                    {point.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {!hasData && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    No sales recorded for this date range.
                </p>
            )}
        </div>
    );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
    return (
        <TableRow>
            <TableCell
                colSpan={colSpan}
                className="h-24 text-center text-muted-foreground"
            >
                No records found.
            </TableCell>
        </TableRow>
    );
}

export default function Reports() {
    const {
        filters,
        summary,
        statusBreakdown,
        dailySales,
        topProducts,
        salesRecords,
        customerReport,
        inventoryReport,
        fulfillment,
        fulfillmentRecords,
    } = usePage<PageProps>().props;
    const [dateRange, setDateRange] = React.useState(filters);

    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/reports', dateRange, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
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
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                Reports & Analytics
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Sales, customers, inventory, fulfillment, and CSV exports.
                            </p>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-end"
                        >
                            <div className="grid gap-1">
                                <label
                                    className="text-xs font-medium text-muted-foreground"
                                    htmlFor="start_date"
                                >
                                    Start date
                                </label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={dateRange.start_date}
                                    onChange={(event) =>
                                        setDateRange((current) => ({
                                            ...current,
                                            start_date: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-1">
                                <label
                                    className="text-xs font-medium text-muted-foreground"
                                    htmlFor="end_date"
                                >
                                    End date
                                </label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={dateRange.end_date}
                                    onChange={(event) =>
                                        setDateRange((current) => ({
                                            ...current,
                                            end_date: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <Button type="submit">
                                <CalendarSearch className="h-4 w-4" />
                                Apply
                            </Button>
                        </form>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Period sales"
                            value={formatCurrency(summary.period_sales)}
                            icon={Banknote}
                            hint={`${formatNumber(summary.period_orders)} revenue orders`}
                        />
                        <StatCard
                            label="Units sold"
                            value={formatNumber(summary.units_sold)}
                            icon={ShoppingCart}
                            hint={`${formatCurrency(summary.avg_order_value)} average order`}
                        />
                        <StatCard
                            label="Collected"
                            value={formatCurrency(summary.collected_amount)}
                            icon={Receipt}
                            hint="Paid payments in range"
                        />
                        <StatCard
                            label="Lifetime sales"
                            value={formatCurrency(summary.total_sales)}
                            icon={PackageCheck}
                            hint={`${formatNumber(summary.total_orders)} total orders`}
                        />
                    </div>

                    <Tabs defaultValue="sales" className="gap-4">
                        <TabsList className="grid h-auto w-full grid-cols-2 md:inline-flex md:w-fit">
                            <TabsTrigger value="sales">Sales</TabsTrigger>
                            <TabsTrigger value="customers">Customers</TabsTrigger>
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sales" className="space-y-6">
                            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                                <ReportCard
                                    title="Daily sales"
                                    exportType="sales"
                                    filters={filters}
                                >
                                    <DailySalesChart data={dailySales ?? []} />
                                </ReportCard>

                                <ReportCard title="Orders by status" filters={filters}>
                                    <div className="space-y-3">
                                        {(statusBreakdown ?? []).map((item) => (
                                            <div
                                                key={item.status}
                                                className="flex items-center justify-between"
                                            >
                                                <StatusBadge status={item.status} />
                                                <span className="text-sm font-medium">
                                                    {formatNumber(item.count)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ReportCard>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-2">
                                <ReportCard title="Top-selling products" filters={filters}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Units</TableHead>
                                                <TableHead className="text-right">Revenue</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topProducts.length ? (
                                                topProducts.map((product) => (
                                                    <TableRow key={product.name}>
                                                        <TableCell className="font-medium">
                                                            {product.name}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(product.units)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(product.revenue)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <EmptyRow colSpan={3} />
                                            )}
                                        </TableBody>
                                    </Table>
                                </ReportCard>

                                <ReportCard
                                    title="Daily sales records"
                                    exportType="sales"
                                    filters={filters}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {salesRecords.length ? (
                                                salesRecords.map((order) => (
                                                    <TableRow key={order.order}>
                                                        <TableCell className="font-medium">
                                                            <div>{order.order}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {order.date} / {order.items} items
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{order.customer}</TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={order.status} />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(order.total)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <EmptyRow colSpan={4} />
                                            )}
                                        </TableBody>
                                    </Table>
                                </ReportCard>
                            </div>
                        </TabsContent>

                        <TabsContent value="customers" className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <StatCard
                                    label="Total customers"
                                    value={formatNumber(customerReport.total_customers)}
                                    icon={Users}
                                />
                                <StatCard
                                    label="New customers"
                                    value={formatNumber(customerReport.new_customers)}
                                    icon={Users}
                                    hint="Joined in selected range"
                                />
                                <StatCard
                                    label="Ordering customers"
                                    value={formatNumber(customerReport.ordering_customers)}
                                    icon={ShoppingCart}
                                    hint="Placed non-cancelled orders"
                                />
                            </div>

                            <ReportCard
                                title="Customer revenue report"
                                exportType="customers"
                                filters={filters}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right">Orders</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                            <TableHead>Last order</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customerReport.topCustomers.length ? (
                                            customerReport.topCustomers.map((customer) => (
                                                <TableRow key={customer.email}>
                                                    <TableCell className="font-medium">
                                                        {customer.customer}
                                                    </TableCell>
                                                    <TableCell>{customer.email}</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(customer.orders)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(customer.revenue)}
                                                    </TableCell>
                                                    <TableCell>{customer.last_order}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <EmptyRow colSpan={5} />
                                        )}
                                    </TableBody>
                                </Table>
                            </ReportCard>
                        </TabsContent>

                        <TabsContent value="inventory" className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    label="SKUs"
                                    value={formatNumber(inventoryReport.summary.total_skus)}
                                    icon={Boxes}
                                />
                                <StatCard
                                    label="Units on hand"
                                    value={formatNumber(inventoryReport.summary.total_units)}
                                    icon={PackageCheck}
                                />
                                <StatCard
                                    label="Stock value"
                                    value={formatCurrency(inventoryReport.summary.stock_value)}
                                    icon={Banknote}
                                />
                                <StatCard
                                    label="Low/out of stock"
                                    value={`${formatNumber(inventoryReport.summary.low_stock)} / ${formatNumber(inventoryReport.summary.out_of_stock)}`}
                                    icon={Boxes}
                                />
                            </div>

                            <div className="grid gap-6 xl:grid-cols-2">
                                <ReportCard
                                    title="Inventory valuation by category"
                                    exportType="inventory"
                                    filters={filters}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-right">SKUs</TableHead>
                                                <TableHead className="text-right">Units</TableHead>
                                                <TableHead className="text-right">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventoryReport.categoryStock.length ? (
                                                inventoryReport.categoryStock.map((row) => (
                                                    <TableRow key={row.category}>
                                                        <TableCell className="font-medium">
                                                            {row.category}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(row.skus)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(row.units)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(row.value)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <EmptyRow colSpan={4} />
                                            )}
                                        </TableBody>
                                    </Table>
                                </ReportCard>

                                <ReportCard
                                    title="Stock attention list"
                                    exportType="inventory"
                                    filters={filters}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Stock</TableHead>
                                                <TableHead className="text-right">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventoryReport.stockAlerts.length ? (
                                                inventoryReport.stockAlerts.map((row) => (
                                                    <TableRow key={row.sku}>
                                                        <TableCell className="font-medium">
                                                            <div>{row.product}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {row.sku} / {row.category}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={STOCK_BADGE[row.status] ?? ''}
                                                                variant="outline"
                                                            >
                                                                {row.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(row.stock)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(row.stock_value)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <EmptyRow colSpan={4} />
                                            )}
                                        </TableBody>
                                    </Table>
                                </ReportCard>
                            </div>
                        </TabsContent>

                        <TabsContent value="fulfillment" className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    label="Open / in progress"
                                    value={formatNumber(fulfillment.open)}
                                    icon={Truck}
                                />
                                <StatCard
                                    label="Ready"
                                    value={formatNumber(fulfillment.ready)}
                                    icon={PackageCheck}
                                />
                                <StatCard
                                    label="Delivered"
                                    value={formatNumber(fulfillment.delivered)}
                                    icon={Receipt}
                                />
                                <StatCard
                                    label="Cancelled"
                                    value={formatNumber(fulfillment.cancelled)}
                                    icon={ShoppingCart}
                                />
                            </div>

                            <ReportCard
                                title="Fulfillment records"
                                exportType="fulfillment"
                                filters={filters}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Age</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fulfillmentRecords.length ? (
                                            fulfillmentRecords.map((order) => (
                                                <TableRow key={order.order}>
                                                    <TableCell className="font-medium">
                                                        <div>{order.order}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {order.date} / {order.items} items
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{order.customer}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={order.status} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatNumber(order.age_days)} days
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(order.total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <EmptyRow colSpan={5} />
                                        )}
                                    </TableBody>
                                </Table>
                            </ReportCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
