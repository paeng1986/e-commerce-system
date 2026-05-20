'use client';

import { router, usePage } from '@inertiajs/react';
import { Eye, Plus, Pencil, Trash2, EyeOff } from 'lucide-react';
import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';

import { Badge } from '@/components/ui/badge';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useToast } from '@/context/ToastContext';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type Product = {
    id: number;
    sku: string;
    name: string;
    brand: string;
    specs: string;
    cost: number;
    warranty: string | number;
    stock: number;
    category: any;
};

type Category = {
    id: number;
    title: string;
};

export type Listing = {
    id: number;
    title: string;
    selling_price: number;
    sale_price: number;
    description: string;
    is_published: boolean;
    featured_image: string[] | null;
    seo_slug: string;
    product?: Product | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    next_page_url: string | null;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export default function ListingPage() {
    const page = usePage<{
        categories: Category[];
        products: PaginatedData<Product>;
        listings: PaginatedData<Listing>;
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    }>();
    const { categories, products, listings, flash } = page.props;

    const queryParams = React.useMemo(
        () => new URLSearchParams(page.url.split('?')[1] ?? ''),
        [page.url],
    );
    const currentListingSearch = queryParams.get('search') ?? '';
    const currentListingCategory = queryParams.get('category') ?? 'all';
    const currentProductSearch = queryParams.get('product_search') ?? '';
    const currentProductCategory = queryParams.get('product_category') ?? 'all';

    const toast = useToast();
    const [previewListing, setPreviewListing] = React.useState<Listing | null>(
        null,
    );
    const [listingSearch, setListingSearch] =
        React.useState(currentListingSearch);
    const [listingCategory, setListingCategory] = React.useState(
        currentListingCategory,
    );
    const [productSearch, setProductSearch] =
        React.useState(currentProductSearch);
    const [productCategory, setProductCategory] = React.useState(
        currentProductCategory,
    );
    const listingRows = listings?.data ?? [];
    const listingPerPage = Number(listings?.per_page ?? 25);
    const productRows = products?.data ?? [];
    const productPerPage = Number(products?.per_page ?? 25);

    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error, toast]);

    const addListing = (id: any) => {
        router.visit(`/admin/listing/${id}`);
    };

    const getImages = (listing: Listing) => listing.featured_image ?? [];

    const getCategoryLabel = (category: Product['category']) => {
        if (!category) {
            return 'Uncategorized';
        }

        if (typeof category === 'string') {
            return category;
        }

        if (typeof category === 'object' && 'title' in category) {
            return String(category.title);
        }

        return String(category);
    };

    const getListingCategory = (listing: Listing) =>
        getCategoryLabel(listing.product?.category);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 2,
        }).format(amount);

    const productCategories = React.useMemo(() => {
        return (categories ?? [])
            .map((category) => category.title)
            .filter(Boolean)
            .sort();
    }, [categories]);

    const listingCategories = React.useMemo(() => {
        return productCategories;
    }, [productCategories]);

    const visitListings = React.useCallback(
        (
            overrides: {
                search?: string;
                category?: string;
                page?: number;
                perPage?: number;
            } = {},
        ) => {
            const nextSearch = overrides.search ?? listingSearch;
            const nextCategory = overrides.category ?? listingCategory;
            const nextPage = overrides.page ?? listings?.current_page ?? 1;
            const nextPerPage = overrides.perPage ?? listingPerPage;
            const data: Record<string, string | number> = {
                page: nextPage,
                per_page: nextPerPage,
                product_page: products?.current_page ?? 1,
                product_per_page: productPerPage,
            };

            if (nextSearch.trim()) {
                data.search = nextSearch.trim();
            }

            if (nextCategory !== 'all') {
                data.category = nextCategory;
            }

            if (productSearch.trim()) {
                data.product_search = productSearch.trim();
            }

            if (productCategory !== 'all') {
                data.product_category = productCategory;
            }

            router.visit('/admin/listings', {
                method: 'get',
                data,
                only: ['listings'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [
            listingCategory,
            listingPerPage,
            listingSearch,
            listings?.current_page,
            productCategory,
            productPerPage,
            productSearch,
            products?.current_page,
        ],
    );

    React.useEffect(() => {
        if (listingSearch === currentListingSearch) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            visitListings({ search: listingSearch, page: 1 });
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [currentListingSearch, listingSearch, visitListings]);

    const listingPageNumbers = React.useMemo(() => {
        const currentPage = listings?.current_page ?? 1;
        const lastPage = listings?.last_page ?? 1;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(lastPage, currentPage + 2);

        return Array.from(
            { length: end - start + 1 },
            (_, index) => start + index,
        );
    }, [listings?.current_page, listings?.last_page]);

    const visitProducts = React.useCallback(
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
                page: listings?.current_page ?? 1,
                per_page: listingPerPage,
                product_page: nextPage,
                product_per_page: nextPerPage,
            };

            if (listingSearch.trim()) {
                data.search = listingSearch.trim();
            }

            if (listingCategory !== 'all') {
                data.category = listingCategory;
            }

            if (nextSearch.trim()) {
                data.product_search = nextSearch.trim();
            }

            if (nextCategory !== 'all') {
                data.product_category = nextCategory;
            }

            router.visit('/admin/listings', {
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
            listingCategory,
            listingPerPage,
            listingSearch,
            listings?.current_page,
        ],
    );

    React.useEffect(() => {
        if (productSearch === currentProductSearch) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            visitProducts({ search: productSearch, page: 1 });
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [currentProductSearch, productSearch, visitProducts]);

    const productPageNumbers = React.useMemo(() => {
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
                {/* HEADER */}
                <header className="flex h-16 items-center gap-2 border-b">
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
                                    <BreadcrumbPage>Listings</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="p-4">
                    {/* SHADCN TABS */}
                    <Tabs defaultValue="listings" className="w-full">
                        <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="listings">Listings</TabsTrigger>
                            <TabsTrigger value="products">Products</TabsTrigger>
                        </TabsList>

                        {/* ---------------- LISTINGS TAB ---------------- */}
                        <TabsContent value="listings" className="mt-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Listings</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
                                        <Input
                                            value={listingSearch}
                                            onChange={(event) =>
                                                setListingSearch(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Search listings..."
                                        />

                                        <Select
                                            value={listingCategory}
                                            onValueChange={(value) => {
                                                setListingCategory(value);
                                                visitListings({
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
                                                {listingCategories.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category}
                                                            value={category}
                                                        >
                                                            {category}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Image</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {listingRows.length ? (
                                                listingRows.map((l) => (
                                                    <TableRow key={l.id}>
                                                        <TableCell>
                                                            {getImages(l)[0] ? (
                                                                <img
                                                                    src={
                                                                        getImages(
                                                                            l,
                                                                        )[0]
                                                                    }
                                                                    alt={
                                                                        l.title
                                                                    }
                                                                    className="h-14 w-14 rounded-md border object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {l.title}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {l.description}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {getListingCategory(
                                                                    l,
                                                                )}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell>
                                                            {formatCurrency(
                                                                l.selling_price,
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            {l.is_published ? (
                                                                <Badge>
                                                                    Published
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">
                                                                    Draft
                                                                </Badge>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="space-x-2 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setPreviewListing(
                                                                        l,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <EyeOff className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No listings match the
                                                        current filters.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {listings?.from ?? 0}-
                                            {listings?.to ?? 0} of{' '}
                                            {listings?.total ?? 0} listings
                                        </div>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Rows per page
                                                </span>
                                                <Select
                                                    value={String(
                                                        listingPerPage,
                                                    )}
                                                    onValueChange={(value) =>
                                                        visitListings({
                                                            perPage:
                                                                Number(value),
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
                                                    disabled={
                                                        !listings?.prev_page_url
                                                    }
                                                    onClick={() =>
                                                        visitListings({
                                                            page: Math.max(
                                                                (listings?.current_page ??
                                                                    1) - 1,
                                                                1,
                                                            ),
                                                        })
                                                    }
                                                >
                                                    Previous
                                                </Button>

                                                {listingPageNumbers.map(
                                                    (pageNumber) => (
                                                        <Button
                                                            key={pageNumber}
                                                            size="sm"
                                                            variant={
                                                                pageNumber ===
                                                                listings?.current_page
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                visitListings({
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
                                                    disabled={
                                                        !listings?.next_page_url
                                                    }
                                                    onClick={() =>
                                                        visitListings({
                                                            page: Math.min(
                                                                (listings?.current_page ??
                                                                    1) + 1,
                                                                listings?.last_page ??
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
                        </TabsContent>

                        {/* ---------------- PRODUCTS TAB ---------------- */}
                        <TabsContent value="products" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Products</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
                                        <Input
                                            value={productSearch}
                                            onChange={(event) =>
                                                setProductSearch(
                                                    event.target.value,
                                                )
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
                                                {productCategories.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category}
                                                            value={category}
                                                        >
                                                            {category}
                                                        </SelectItem>
                                                    ),
                                                )}
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
                                                <TableHead>Stock</TableHead>
                                                <TableHead className="text-right">
                                                    Action
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {productRows.length ? (
                                                productRows.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>
                                                            {p.sku}
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.brand}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {getCategoryLabel(
                                                                    p.category,
                                                                )}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {p.stock}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    addListing(
                                                                        p.id,
                                                                    )
                                                                }
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Add Listing
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No products match the
                                                        current filters.
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
                                                    value={String(
                                                        productPerPage,
                                                    )}
                                                    onValueChange={(value) =>
                                                        visitProducts({
                                                            perPage:
                                                                Number(value),
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
                                                    disabled={
                                                        !products?.prev_page_url
                                                    }
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
                                                    disabled={
                                                        !products?.next_page_url
                                                    }
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
                        </TabsContent>
                    </Tabs>

                    <Dialog
                        open={Boolean(previewListing)}
                        onOpenChange={(open) => {
                            if (!open) {
                                setPreviewListing(null);
                            }
                        }}
                    >
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {previewListing?.title}
                                </DialogTitle>
                            </DialogHeader>

                            {previewListing && (
                                <div className="space-y-5">
                                    {getImages(previewListing).length ? (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {getImages(previewListing).map(
                                                (image, index) => (
                                                    <img
                                                        key={`${image}-${index}`}
                                                        src={image}
                                                        alt={`${previewListing.title} image ${index + 1}`}
                                                        className="aspect-video w-full rounded-md border object-cover"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex aspect-video items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                                            No featured images uploaded.
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-md border p-3">
                                            <div className="text-xs text-muted-foreground">
                                                Selling Price
                                            </div>
                                            <div className="mt-1 font-medium">
                                                {formatCurrency(
                                                    previewListing.selling_price,
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-md border p-3">
                                            <div className="text-xs text-muted-foreground">
                                                Sale Price
                                            </div>
                                            <div className="mt-1 font-medium">
                                                {formatCurrency(
                                                    previewListing.sale_price,
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-md border p-3">
                                            <div className="text-xs text-muted-foreground">
                                                Status
                                            </div>
                                            <div className="mt-1">
                                                {previewListing.is_published ? (
                                                    <Badge>Published</Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-md border p-3">
                                        <div className="text-xs text-muted-foreground">
                                            Description
                                        </div>
                                        <p className="mt-2 text-sm leading-6">
                                            {previewListing.description ||
                                                'No description.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
