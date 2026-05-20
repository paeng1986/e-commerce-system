'use client';

import { router, usePage, useForm } from '@inertiajs/react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

import { useToast } from '@/context/ToastContext';

type ProductCategory = {
    id: number;
    title: string;
    description: string | null;
};

type SpecEntry = {
    id: string;
    value: string;
};

export type Product = {
    id: number;
    sku: string;
    name: string;
    brand: string;

    keys: string; // "GDDR6,PCIe"
    specs: string; // "8GB,4.0"

    cost: number;
    warranty: string | number;
    stock: number;

    category: any; // replace with real type if available
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
/*                                COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function StockCell({ stock }: { stock: number }) {
    if (stock <= 3) {
        return <span className="font-medium text-red-500">{stock}</span>;
    }

    if (stock <= 10) {
        return <span className="font-medium text-yellow-500">{stock}</span>;
    }

    return <span>{stock}</span>;
}

/* -------------------------------------------------------------------------- */
/*                              ADD PRODUCT DIALOG                            */
/* -------------------------------------------------------------------------- */

function AddProductDialog({
    categories,
    onSuccess,
    onError,
}: {
    categories: ProductCategory[];
    onSuccess?: () => void;
    onError?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [specs, setSpecs] = useState<SpecEntry[]>([
        { id: crypto.randomUUID(), value: '' },
    ]);
    const { data, setData, post, reset, processing, errors, clearErrors } =
        useForm({
            sku: '',
            name: '',
            brand: '',
            product_category_id: '',
            cost: 0,
            specs: '',
            stock: 0,
            warranty: 'Lifetime',
        });

    /* ---- spec helpers ---- */

    const addSpec = useCallback(() => {
        setSpecs((prev) => [...prev, { id: crypto.randomUUID(), value: '' }]);
    }, []);

    const removeSpec = useCallback((id: string) => {
        setSpecs((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const updateSpec = useCallback((id: string, val: string) => {
        setSpecs((prev) =>
            prev.map((s) => (s.id === id ? { ...s, value: val } : s)),
        );
    }, []);

    /* ---- submit ---- */

    function handleSubmit() {
        // Convert specs array to a single formatted string, e.g. "RAM: 16GB | Storage: 512GB"
        const specsString = specs
            .filter((s) => s.value.trim() !== '')
            .map((s) => s.value.trim())
            .join(', ');

        setData('specs', specsString);

        const options = {
            onSuccess: () => {
                reset();
                setSpecs([{ id: crypto.randomUUID(), value: '' }]);
                setOpen(false);
                onSuccess?.();
            },

            onError: () => onError?.(),
        };

        post('/admin/product', options);
    }

    function handleOpenChange(value: boolean) {
        if (!value) {
            reset();
            clearErrors();
            setSpecs([{ id: crypto.randomUUID(), value: '' }]);
        }

        setOpen(value);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>Add product</Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Add product</DialogTitle>
                    <DialogDescription>
                        Fill in the product details below. Click save when
                        you're done.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* SKU */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sku" className="text-right">
                            SKU
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="sku"
                                placeholder="e.g. PRD-001"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                            />
                            {errors.sku && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.sku}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="name"
                                placeholder="Product name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="brand" className="text-right">
                            Brand
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="brand"
                                placeholder="Brand name"
                                value={data.brand}
                                onChange={(e) =>
                                    setData('brand', e.target.value)
                                }
                            />
                            {errors.brand && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.brand}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Category</Label>
                        <div className="col-span-3">
                            <Select
                                value={data.product_category_id}
                                onValueChange={(val) =>
                                    setData('product_category_id', val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.product_category_id && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.product_category_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* cost */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cost" className="text-right">
                            cost
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="cost"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                value={data.cost}
                                onChange={(e) =>
                                    setData(
                                        'cost',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                            />
                            {errors.cost && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.cost}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                            Stock
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="stock"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                value={data.stock}
                                onChange={(e) =>
                                    setData(
                                        'stock',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                            />
                            {errors.stock && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.stock}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Warranty */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Warranty</Label>
                        <div className="col-span-3">
                            <Select
                                value={data.warranty}
                                onValueChange={(val) =>
                                    setData('warranty', val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select warranty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lifetime">
                                        Lifetime
                                    </SelectItem>
                                    <SelectItem value="1">1 Year</SelectItem>
                                    <SelectItem value="2">2 Years</SelectItem>
                                    <SelectItem value="3">3 Years</SelectItem>
                                    <SelectItem value="5">5 Years</SelectItem>
                                    <SelectItem value="None">
                                        No Warranty
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.warranty && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.warranty}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="pt-2 text-right">Specs</Label>
                        <div className="col-span-3 flex flex-col gap-2">
                            {specs.map((spec) => (
                                <div
                                    key={spec.id}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        placeholder="Value (e.g. 16GB)"
                                        value={spec.value}
                                        onChange={(e) =>
                                            updateSpec(spec.id, e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 text-muted-foreground hover:text-red-500"
                                        disabled={specs.length === 1}
                                        onClick={() => removeSpec(spec.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-1 w-fit"
                                onClick={addSpec}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Add spec
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={processing}
                        onClick={handleSubmit}
                    >
                        {processing ? 'Saving…' : 'Save product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BulkUploadDialog() {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        file: null as File | null,
    });

    function submit() {
        post('/admin/products/bulk-upload', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Upload Products</DialogTitle>
                    <DialogDescription>
                        Upload CSV file using the template format.
                    </DialogDescription>
                </DialogHeader>

                <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                        setData('file', e.target.files?.[0] || null)
                    }
                />

                <DialogFooter>
                    <Button onClick={() => setOpen(false)} variant="outline">
                        Cancel
                    </Button>

                    <Button
                        onClick={submit}
                        disabled={processing || !data.file}
                    >
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function Products() {
    const page = usePage<{
        categories: ProductCategory[];
        products: PaginatedData<Product>;
    }>();
    const { categories, products } = page.props;

    const toast = useToast();
    const queryParams = useMemo(
        () => new URLSearchParams(page.url.split('?')[1] ?? ''),
        [page.url],
    );
    const currentSearch = queryParams.get('search') ?? '';
    const currentCategory = queryParams.get('category') ?? 'all';
    const [productSearch, setProductSearch] = useState(currentSearch);
    const [productCategory, setProductCategory] = useState(currentCategory);
    const productRows = products?.data ?? [];
    const productPerPage = Number(products?.per_page ?? 25);
    const categoryOptions = useMemo(
        () =>
            (categories ?? [])
                .map((category) => category.title)
                .filter(Boolean)
                .sort(),
        [categories],
    );

    const visitProducts = useCallback(
        (
            overrides: {
                search?: string;
                category?: string;
                page?: number;
                perPage?: number;
            } = {},
        ) => {
            const nextSearch = overrides.search ?? productSearch;
            const nextCategory = overrides.category ?? productCategory;
            const nextPage = overrides.page ?? products?.current_page ?? 1;
            const nextPerPage = overrides.perPage ?? productPerPage;
            const data: Record<string, string | number> = {
                page: nextPage,
                per_page: nextPerPage,
            };

            if (nextSearch.trim()) {
                data.search = nextSearch.trim();
            }

            if (nextCategory !== 'all') {
                data.category = nextCategory;
            }

            router.visit('/admin/products', {
                method: 'get',
                data,
                only: ['products'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [
            productCategory,
            productPerPage,
            productSearch,
            products?.current_page,
        ],
    );

    useEffect(() => {
        if (productSearch === currentSearch) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            visitProducts({ search: productSearch, page: 1 });
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [currentSearch, productSearch, visitProducts]);

    const productPageNumbers = useMemo(() => {
        const currentPage = products?.current_page ?? 1;
        const lastPage = products?.last_page ?? 1;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(lastPage, currentPage + 2);

        return Array.from(
            { length: end - start + 1 },
            (_, index) => start + index,
        );
    }, [products?.current_page, products?.last_page]);

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                {/* Header */}
                <header className="flex h-16 items-center gap-2 border-b px-4">
                    <SidebarTrigger />

                    <Separator orientation="vertical" className="h-4" />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">
                                    Admin Portal
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage>Products</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-6 p-4">
                    {/* Products Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>All products</CardTitle>

                            <div className="flex gap-2">
                                <AddProductDialog
                                    categories={categories}
                                    onSuccess={() =>
                                        toast.success(
                                            'Product added successfully.',
                                        )
                                    }
                                    onError={() => {
                                        toast.error('Failed to add product.');
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        window.open(
                                            '/admin/products/template',
                                            '_blank',
                                        )
                                    }
                                >
                                    Download Template
                                </Button>

                                <BulkUploadDialog />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
                                <Input
                                    value={productSearch}
                                    onChange={(event) =>
                                        setProductSearch(event.target.value)
                                    }
                                    placeholder="Search products..."
                                />

                                <Select
                                    value={productCategory}
                                    onValueChange={(value) => {
                                        setProductCategory(value);
                                        visitProducts({
                                            category: value,
                                            page: 1,
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All categories
                                        </SelectItem>
                                        {categoryOptions.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Specs</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Warranty</TableHead>
                                        <TableHead>Stock</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {productRows.length ? (
                                        productRows.map((p) => (
                                            <TableRow key={p.sku}>
                                                <TableCell className="font-medium">
                                                    {p.sku}
                                                </TableCell>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell>{p.brand}</TableCell>
                                                <TableCell>
                                                    {p.category}
                                                </TableCell>
                                                <TableCell>{p.specs}</TableCell>
                                                <TableCell>{p.cost}</TableCell>
                                                <TableCell>
                                                    {p.warranty}
                                                </TableCell>
                                                <TableCell>
                                                    <StockCell
                                                        stock={p.stock}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No products match the current
                                                filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {products?.from ?? 0}-
                                    {products?.to ?? 0} of{' '}
                                    {products?.total ?? 0} products
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Rows per page
                                        </span>
                                        <Select
                                            value={String(productPerPage)}
                                            onValueChange={(value) =>
                                                visitProducts({
                                                    perPage: Number(value),
                                                    page: 1,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[10, 25, 50, 100].map(
                                                    (value) => (
                                                        <SelectItem
                                                            key={value}
                                                            value={String(
                                                                value,
                                                            )}
                                                        >
                                                            {value}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!products?.prev_page_url}
                                            onClick={() =>
                                                visitProducts({
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

                                        {productPageNumbers.map(
                                            (pageNumber) => (
                                                <Button
                                                    key={pageNumber}
                                                    size="sm"
                                                    variant={
                                                        pageNumber ===
                                                        products?.current_page
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        visitProducts({
                                                            page: pageNumber,
                                                        })
                                                    }
                                                >
                                                    {pageNumber}
                                                </Button>
                                            ),
                                        )}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!products?.next_page_url}
                                            onClick={() =>
                                                visitProducts({
                                                    page: Math.min(
                                                        (products?.current_page ??
                                                            1) + 1,
                                                        products?.last_page ??
                                                            1,
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
            </SidebarInset>
        </SidebarProvider>
    );
}
