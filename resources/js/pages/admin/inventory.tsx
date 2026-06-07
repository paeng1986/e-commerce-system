'use client';

import * as React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Boxes, PackageCheck, PencilLine, TriangleAlert, XCircle } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { useToast } from '@/context/ToastContext';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type Category = {
    id: number;
    title: string;
    description: string | null;
};

type InventoryItem = {
    id: number;
    sku: string;
    name: string;
    brand: string;
    specs: string | null;
    cost: number | string;
    warranty: string | number;
    stock: number;
    category: { title: string } | string | null;
    stock_value: number | string;
};

type Stats = {
    total_skus: number;
    total_units: number;
    stock_value: number;
    low_stock: number;
    out_of_stock: number;
    low_stock_threshold: number;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    next_page_url: string | null;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number | string | null | undefined): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(toNumber(value));
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH').format(value);
}

function getCategoryLabel(category: InventoryItem['category']): string {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.title) return category.title;
    return 'Uncategorized';
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
    title,
    value,
    icon: Icon,
    variant,
    hint,
}: {
    title: string;
    value: string;
    icon: React.ElementType;
    variant?: 'warn' | 'danger';
    hint?: string;
}) {
    const valueColor =
        variant === 'danger'
            ? 'text-red-500'
            : variant === 'warn'
              ? 'text-yellow-500'
              : '';

    return (
        <Card>
            <CardContent className="flex items-start justify-between p-5">
                <div>
                    <div className="text-sm text-muted-foreground">{title}</div>
                    <div className={`mt-2 text-3xl font-bold ${valueColor}`}>
                        {value}
                    </div>
                    {hint && (
                        <div className="mt-1 text-xs text-muted-foreground">
                            {hint}
                        </div>
                    )}
                </div>
                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            </CardContent>
        </Card>
    );
}

function stockStatus(stock: number, threshold: number) {
    if (stock <= 0)
        return { label: 'Out of stock', className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' };
    if (stock <= threshold)
        return { label: 'Low stock', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' };
    return { label: 'In stock', className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' };
}

function StockCell({ stock, threshold }: { stock: number; threshold: number }) {
    const color =
        stock <= 0
            ? 'text-red-500'
            : stock <= threshold
              ? 'text-yellow-500'
              : '';
    return <span className={`font-medium ${color}`}>{stock}</span>;
}

/* -------------------------------------------------------------------------- */
/*                             ADJUST STOCK DIALOG                            */
/* -------------------------------------------------------------------------- */

function AdjustStockDialog({
    item,
    onClose,
}: {
    item: InventoryItem | null;
    onClose: () => void;
}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        stock: 0,
    });

    React.useEffect(() => {
        if (item) setData('stock', item.stock);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;
        put(`/admin/inventory/${item.id}/stock`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const delta = item ? data.stock - item.stock : 0;

    return (
        <Dialog
            open={Boolean(item)}
            onOpenChange={(open) => {
                if (!open) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adjust stock</DialogTitle>
                    <DialogDescription>
                        {item?.brand} {item?.name} · {item?.sku}
                    </DialogDescription>
                </DialogHeader>

                {item && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3 text-sm">
                            <span className="text-muted-foreground">
                                Current on hand
                            </span>
                            <span className="font-semibold">{item.stock}</span>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="stock">New quantity</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setData(
                                            'stock',
                                            Math.max(0, data.stock - 1),
                                        )
                                    }
                                >
                                    −
                                </Button>
                                <Input
                                    id="stock"
                                    type="number"
                                    min={0}
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData(
                                            'stock',
                                            Math.max(
                                                0,
                                                parseInt(e.target.value, 10) ||
                                                    0,
                                            ),
                                        )
                                    }
                                    className="text-center"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setData('stock', data.stock + 1)
                                    }
                                >
                                    +
                                </Button>
                            </div>
                            {delta !== 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {delta > 0 ? '+' : ''}
                                    {delta} vs. current
                                </p>
                            )}
                            {errors.stock && (
                                <p className="text-xs text-red-500">
                                    {errors.stock}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset();
                                    onClose();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Inventory() {
    const page = usePage<{
        categories: Category[];
        products: PaginatedData<InventoryItem>;
        stats: Stats;
        flash?: { success?: string | null; error?: string | null };
    }>();
    const { categories, products, stats, flash } = page.props;

    const toast = useToast();

    const queryParams = React.useMemo(
        () => new URLSearchParams(page.url.split('?')[1] ?? ''),
        [page.url],
    );
    const currentSearch = queryParams.get('search') ?? '';
    const currentCategory = queryParams.get('category') ?? 'all';
    const currentStock = queryParams.get('stock') ?? 'all';

    const [search, setSearch] = React.useState(currentSearch);
    const [category, setCategory] = React.useState(currentCategory);
    const [stockFilter, setStockFilter] = React.useState(currentStock);
    const [adjustItem, setAdjustItem] = React.useState<InventoryItem | null>(
        null,
    );

    const rows = products?.data ?? [];
    const perPage = Number(products?.per_page ?? 25);
    const threshold = stats?.low_stock_threshold ?? 10;

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error, toast]);

    const categoryOptions = React.useMemo(
        () =>
            (categories ?? [])
                .map((c) => c.title)
                .filter(Boolean)
                .sort(),
        [categories],
    );

    const visit = React.useCallback(
        (
            overrides: {
                search?: string;
                category?: string;
                stock?: string;
                page?: number;
                perPage?: number;
            } = {},
        ) => {
            const nextSearch = overrides.search ?? search;
            const nextCategory = overrides.category ?? category;
            const nextStock = overrides.stock ?? stockFilter;
            const nextPage = overrides.page ?? products?.current_page ?? 1;
            const nextPerPage = overrides.perPage ?? perPage;

            const data: Record<string, string | number> = {
                page: nextPage,
                per_page: nextPerPage,
            };
            if (nextSearch.trim()) data.search = nextSearch.trim();
            if (nextCategory !== 'all') data.category = nextCategory;
            if (nextStock !== 'all') data.stock = nextStock;

            router.visit('/admin/inventory', {
                method: 'get',
                data,
                only: ['products'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [category, perPage, products?.current_page, search, stockFilter],
    );

    React.useEffect(() => {
        if (search === currentSearch) return;
        const id = window.setTimeout(
            () => visit({ search, page: 1 }),
            400,
        );
        return () => window.clearTimeout(id);
    }, [currentSearch, search, visit]);

    const pageNumbers = React.useMemo(() => {
        const currentPage = products?.current_page ?? 1;
        const lastPage = products?.last_page ?? 1;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(lastPage, currentPage + 2);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [products?.current_page, products?.last_page]);

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
                                    <BreadcrumbPage>Inventory</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-col gap-6 p-4">
                    {/* STATS */}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total SKUs"
                            value={formatNumber(stats?.total_skus ?? 0)}
                            icon={Boxes}
                            hint={`${formatNumber(stats?.total_units ?? 0)} units on hand`}
                        />
                        <StatCard
                            title="Inventory value"
                            value={formatCurrency(stats?.stock_value ?? 0)}
                            icon={PackageCheck}
                            hint="Cost × stock"
                        />
                        <StatCard
                            title="Low stock"
                            value={formatNumber(stats?.low_stock ?? 0)}
                            icon={TriangleAlert}
                            variant="warn"
                            hint={`At or below ${threshold} units`}
                        />
                        <StatCard
                            title="Out of stock"
                            value={formatNumber(stats?.out_of_stock ?? 0)}
                            icon={XCircle}
                            variant="danger"
                        />
                    </div>

                    {/* TABLE */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock levels</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_200px]">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by SKU, name or brand..."
                                />

                                <Select
                                    value={category}
                                    onValueChange={(value) => {
                                        setCategory(value);
                                        visit({ category: value, page: 1 });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All categories
                                        </SelectItem>
                                        {categoryOptions.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={stockFilter}
                                    onValueChange={(value) => {
                                        setStockFilter(value);
                                        visit({ stock: value, page: 1 });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Stock status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All stock
                                        </SelectItem>
                                        <SelectItem value="in">
                                            In stock
                                        </SelectItem>
                                        <SelectItem value="low">
                                            Low stock
                                        </SelectItem>
                                        <SelectItem value="out">
                                            Out of stock
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">
                                            Cost
                                        </TableHead>
                                        <TableHead className="text-right">
                                            In stock
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Stock value
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {rows.length ? (
                                        rows.map((item) => {
                                            const status = stockStatus(
                                                item.stock,
                                                threshold,
                                            );
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.sku}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.brand}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {getCategoryLabel(
                                                                item.category,
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            item.cost,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <StockCell
                                                            stock={item.stock}
                                                            threshold={threshold}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            item.stock_value,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                status.className
                                                            }
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setAdjustItem(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            <PencilLine className="mr-2 h-4 w-4" />
                                                            Adjust
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No items match the current
                                                filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {products?.from ?? 0}-
                                    {products?.to ?? 0} of{' '}
                                    {products?.total ?? 0} items
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Rows per page
                                        </span>
                                        <Select
                                            value={String(perPage)}
                                            onValueChange={(value) =>
                                                visit({
                                                    perPage: Number(value),
                                                    page: 1,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[10, 25, 50, 100].map((v) => (
                                                    <SelectItem
                                                        key={v}
                                                        value={String(v)}
                                                    >
                                                        {v}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!products?.prev_page_url}
                                            onClick={() =>
                                                visit({
                                                    page: Math.max(
                                                        (products?.current_page ??
                                                            1) - 1,
                                                        1,
                                                    ),
                                                })
                                            }
                                        >
                                            Previous
                                        </Button>

                                        {pageNumbers.map((n) => (
                                            <Button
                                                key={n}
                                                size="sm"
                                                variant={
                                                    n === products?.current_page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    visit({ page: n })
                                                }
                                            >
                                                {n}
                                            </Button>
                                        ))}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!products?.next_page_url}
                                            onClick={() =>
                                                visit({
                                                    page: Math.min(
                                                        (products?.current_page ??
                                                            1) + 1,
                                                        products?.last_page ?? 1,
                                                    ),
                                                })
                                            }
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AdjustStockDialog
                    item={adjustItem}
                    onClose={() => setAdjustItem(null)}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}
