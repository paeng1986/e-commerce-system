'use client';

import * as React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Cpu, Eye, Minus, Plus, Tag, Trash2, X } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/context/ToastContext';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Product = {
    id: number;
    sku: string;
    name: string;
    brand: string;
    specs: string;
    cost: number | string;
    warranty: string | number;
    stock: number;
    category: { title: string } | string | null;
};

type BuildItem = {
    id: number;
    product_id: number;
    category_type: string;
    quantity: number;
    price_snapshot: number | string;
    spec_snapshot: {
        sku?: string;
        name?: string;
        brand?: string;
        specs?: string;
    } | null;
    product: { id: number; name: string; brand: string; sku: string } | null;
};

type BuildListing = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    selling_price: number | string;
    sale_price: number | string | null;
    is_featured: boolean;
    is_published: boolean;
    status: string;
};

type Build = {
    id: number;
    name: string;
    notes: string | null;
    status: string;
    estimated_total_price: number | string;
    created_at: string | null;
    items: BuildItem[];
    listing: BuildListing | null;
};

type PageProps = {
    products: Product[];
    builds: Build[];
    flash?: { success?: string | null; error?: string | null };
};

/* -------------------------------------------------------------------------- */
/*                               CATEGORY CONFIG                              */
/* -------------------------------------------------------------------------- */

/**
 * Categories sourced from the seeded ProductCategory list. `max` caps how many
 * of each component a single build may contain.
 */
const CATEGORY_CONFIG: Record<string, { label: string; max: number }> = {
    CPU: { label: 'CPU', max: 1 },
    GPU: { label: 'GPU', max: 1 },
    Motherboard: { label: 'Motherboard', max: 1 },
    RAM: { label: 'RAM', max: 4 },
    Storage: { label: 'Storage', max: 4 },
    PSU: { label: 'PSU', max: 1 },
    Monitor: { label: 'Monitor', max: 2 },
    Peripheral: { label: 'Peripheral', max: 4 },
};

const CATEGORY_ORDER = [
    'CPU',
    'GPU',
    'Motherboard',
    'RAM',
    'Storage',
    'PSU',
    'Monitor',
    'Peripheral',
];

const STATUS_BADGE: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    listed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    published:
        'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getCategoryTitle(product: Product): string {
    const category = product.category;
    if (!category) return 'Other';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.title) return category.title;
    return 'Other';
}

function toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value: number | string | null | undefined): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(toNumber(value));
}

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');

/* -------------------------------------------------------------------------- */
/*                              BUILDER (CREATE)                              */
/* -------------------------------------------------------------------------- */

/** A single selected slot: which product and how many. */
type Slot = { productId: number | null; quantity: number };

function emptySlots(): Record<string, Slot[]> {
    return Object.fromEntries(
        CATEGORY_ORDER.map((c) => [c, [{ productId: null, quantity: 1 }]]),
    );
}

function BuildCreator({
    productsByCategory,
}: {
    productsByCategory: Record<string, Product[]>;
}) {
    const [slots, setSlots] = React.useState<Record<string, Slot[]>>(emptySlots);

    const { data, setData, transform, post, processing, errors, reset } =
        useForm({
            name: '',
            notes: '',
            status: 'draft',
        });

    /* ---- derive selected products + total ---- */
    const selected = React.useMemo(() => {
        const rows: { product: Product; quantity: number; category: string }[] =
            [];
        CATEGORY_ORDER.forEach((cat) => {
            (slots[cat] || []).forEach((slot) => {
                if (slot.productId == null) return;
                const product = (productsByCategory[cat] || []).find(
                    (p) => p.id === slot.productId,
                );
                if (product)
                    rows.push({
                        product,
                        quantity: slot.quantity,
                        category: cat,
                    });
            });
        });
        return rows;
    }, [slots, productsByCategory]);

    const total = selected.reduce(
        (sum, row) => sum + toNumber(row.product.cost) * row.quantity,
        0,
    );

    /* ---- slot mutations ---- */
    const setSlot = (cat: string, idx: number, patch: Partial<Slot>) =>
        setSlots((prev) => {
            const arr = [...(prev[cat] || [])];
            arr[idx] = { ...arr[idx], ...patch };
            return { ...prev, [cat]: arr };
        });

    const addSlot = (cat: string) =>
        setSlots((prev) => {
            const arr = prev[cat] || [];
            const max = CATEGORY_CONFIG[cat]?.max ?? 1;
            if (arr.length >= max) return prev;
            return { ...prev, [cat]: [...arr, { productId: null, quantity: 1 }] };
        });

    const removeSlot = (cat: string, idx: number) =>
        setSlots((prev) => {
            const arr = [...(prev[cat] || [])];
            arr.splice(idx, 1);
            return {
                ...prev,
                [cat]: arr.length ? arr : [{ productId: null, quantity: 1 }],
            };
        });

    /* ---- submit ---- */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.name.trim() || selected.length === 0) return;

        transform((form) => ({
            ...form,
            items: selected.map((row) => ({
                product_id: row.product.id,
                category_type: row.category,
                quantity: row.quantity,
            })),
        }));

        post('/admin/pc-build', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSlots(emptySlots());
            },
        });
    };

    const activeCategories = CATEGORY_ORDER.filter(
        (cat) => (productsByCategory[cat]?.length ?? 0) > 0,
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"
        >
            {/* ---------------- LEFT: component picker ---------------- */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom PC build</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Pick components per category. Prices are snapshotted when
                        the build is saved.
                    </p>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Name + status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label>Build name</Label>
                            <Input
                                placeholder="e.g. Gaming Build 2026"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(v) => setData('status', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="listed">
                                        Ready to list
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <Label>Notes</Label>
                        <Textarea
                            placeholder="Internal notes about this build (optional)"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                    <Separator />

                    {/* Category slots */}
                    {activeCategories.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No products available. Add products first to build a
                            PC.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {activeCategories.map((cat) => {
                                const products = productsByCategory[cat] || [];
                                const cfg = CATEGORY_CONFIG[cat] ?? {
                                    label: cat,
                                    max: 1,
                                };
                                const catSlots = slots[cat] || [];

                                return (
                                    <div key={cat} className="space-y-2">
                                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {cfg.label}
                                        </Label>

                                        {catSlots.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2"
                                            >
                                                <Select
                                                    value={
                                                        slot.productId?.toString() ??
                                                        ''
                                                    }
                                                    onValueChange={(v) =>
                                                        setSlot(cat, idx, {
                                                            productId: v
                                                                ? parseInt(v, 10)
                                                                : null,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue
                                                            placeholder={`Select ${cfg.label}`}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map((p) => (
                                                            <SelectItem
                                                                key={p.id}
                                                                value={p.id.toString()}
                                                            >
                                                                <span className="flex w-full items-center justify-between gap-6">
                                                                    <span>
                                                                        {p.brand}{' '}
                                                                        {p.name}
                                                                    </span>
                                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                                        {formatPrice(
                                                                            p.cost,
                                                                        )}{' '}
                                                                        · Stock:{' '}
                                                                        {p.stock}
                                                                    </span>
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {/* Quantity stepper */}
                                                <div className="flex items-center rounded-md border">
                                                    <button
                                                        type="button"
                                                        className="px-2 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                                                        disabled={
                                                            slot.quantity <= 1
                                                        }
                                                        onClick={() =>
                                                            setSlot(cat, idx, {
                                                                quantity:
                                                                    slot.quantity -
                                                                    1,
                                                            })
                                                        }
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm">
                                                        {slot.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="px-2 py-2 text-muted-foreground hover:text-foreground"
                                                        onClick={() =>
                                                            setSlot(cat, idx, {
                                                                quantity:
                                                                    slot.quantity +
                                                                    1,
                                                            })
                                                        }
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                {catSlots.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() =>
                                                            removeSlot(cat, idx)
                                                        }
                                                        aria-label="Remove slot"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        {catSlots.length < cfg.max && (
                                            <button
                                                type="button"
                                                onClick={() => addSlot(cat)}
                                                className="h-8 w-full rounded-md border border-dashed text-xs text-muted-foreground transition-colors hover:bg-muted"
                                            >
                                                + Add another {cfg.label}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {(errors as Record<string, string>).build && (
                        <p className="text-xs text-red-500">
                            {(errors as Record<string, string>).build}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* ---------------- RIGHT: summary ---------------- */}
            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Build summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selected.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No components selected yet.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {selected.map((row, i) => (
                                    <div
                                        key={`${row.product.id}-${i}`}
                                        className="flex items-start justify-between gap-3 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">
                                                {row.product.brand}{' '}
                                                {row.product.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.category} · ×{row.quantity}
                                            </div>
                                        </div>
                                        <div className="shrink-0 font-medium">
                                            {formatPrice(
                                                toNumber(row.product.cost) *
                                                    row.quantity,
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Separator />

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Estimated total
                            </span>
                            <span className="text-lg font-semibold">
                                {formatPrice(total)}
                            </span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                processing ||
                                !data.name.trim() ||
                                selected.length === 0
                            }
                        >
                            {processing ? 'Saving…' : 'Save build'}
                        </Button>
                    </CardContent>
                </Card>
            </aside>
        </form>
    );
}

/* -------------------------------------------------------------------------- */
/*                            LISTING DIALOG (PUBLISH)                        */
/* -------------------------------------------------------------------------- */

function ListBuildDialog({
    build,
    onClose,
}: {
    build: Build | null;
    onClose: () => void;
}) {
    const slugEdited = React.useRef(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        pc_build_id: 0,
        title: '',
        slug: '',
        description: '',
        selling_price: '',
        sale_price: '',
        is_featured: false,
        is_published: true,
    });

    /* Seed form whenever a build is opened. */
    React.useEffect(() => {
        if (!build) return;
        slugEdited.current = false;
        const existing = build.listing;
        const defaultTitle = existing?.title ?? build.name;
        setData({
            pc_build_id: build.id,
            title: defaultTitle,
            slug: existing?.slug ?? toSlug(defaultTitle),
            description: existing?.description ?? build.notes ?? '',
            selling_price: String(
                existing?.selling_price ?? build.estimated_total_price ?? '',
            ),
            sale_price:
                existing?.sale_price != null
                    ? String(existing.sale_price)
                    : '',
            is_featured: existing?.is_featured ?? false,
            is_published: existing?.is_published ?? true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [build?.id]);

    const handleTitleChange = (value: string) =>
        setData((prev) => ({
            ...prev,
            title: value,
            slug: slugEdited.current ? prev.slug : toSlug(value),
        }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pc-build-listing', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog
            open={Boolean(build)}
            onOpenChange={(open) => {
                if (!open) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {build?.listing ? 'Update listing' : 'List PC build'}
                    </DialogTitle>
                </DialogHeader>

                {build && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="rounded-md border bg-muted/30 p-3 text-sm">
                            <div className="font-medium">{build.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {build.items.length} components · est.{' '}
                                {formatPrice(build.estimated_total_price)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Listing title</Label>
                            <Input
                                value={data.title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder="e.g. RTX 4070 Gaming PC"
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Selling price</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={data.selling_price}
                                    onChange={(e) =>
                                        setData('selling_price', e.target.value)
                                    }
                                />
                                {errors.selling_price && (
                                    <p className="text-xs text-red-500">
                                        {errors.selling_price}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Sale price</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={data.sale_price}
                                    onChange={(e) =>
                                        setData('sale_price', e.target.value)
                                    }
                                />
                                {errors.sale_price && (
                                    <p className="text-xs text-red-500">
                                        {errors.sale_price}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Slug</Label>
                            <Input
                                value={data.slug}
                                onChange={(e) => {
                                    slugEdited.current = true;
                                    setData('slug', e.target.value);
                                }}
                                placeholder="auto-generated-or-custom-slug"
                            />
                            {errors.slug && (
                                <p className="text-xs text-red-500">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Short description shown on the storefront…"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <p className="text-sm font-medium">Featured</p>
                                <p className="text-xs text-muted-foreground">
                                    Highlight this build on the storefront
                                </p>
                            </div>
                            <Switch
                                checked={data.is_featured}
                                onCheckedChange={(v) => setData('is_featured', v)}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <p className="text-sm font-medium">Published</p>
                                <p className="text-xs text-muted-foreground">
                                    Make this listing visible to customers
                                </p>
                            </div>
                            <Switch
                                checked={data.is_published}
                                onCheckedChange={(v) =>
                                    setData('is_published', v)
                                }
                            />
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
                                {processing
                                    ? 'Saving…'
                                    : build.listing
                                      ? 'Update listing'
                                      : 'Publish listing'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                            BUILD DETAILS DIALOG                            */
/* -------------------------------------------------------------------------- */

function BuildDetailsDialog({
    build,
    onClose,
}: {
    build: Build | null;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={Boolean(build)}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{build?.name}</DialogTitle>
                </DialogHeader>

                {build && (
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Component</TableHead>
                                    <TableHead className="text-center">
                                        Qty
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Price
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {build.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {item.category_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {item.spec_snapshot?.brand}{' '}
                                                {item.spec_snapshot?.name ??
                                                    item.product?.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.spec_snapshot?.sku}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatPrice(
                                                toNumber(item.price_snapshot) *
                                                    item.quantity,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-sm text-muted-foreground">
                                Estimated total
                            </span>
                            <span className="text-lg font-semibold">
                                {formatPrice(build.estimated_total_price)}
                            </span>
                        </div>

                        {build.notes && (
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">
                                    Notes
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                    {build.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                                 SAVED BUILDS                               */
/* -------------------------------------------------------------------------- */

function SavedBuilds({
    builds,
    onView,
    onList,
    onCreate,
}: {
    builds: Build[];
    onView: (build: Build) => void;
    onList: (build: Build) => void;
    onCreate: () => void;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                    <CardTitle>PC Builds</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Custom builds ready to be listed on the storefront.
                    </p>
                </div>
                <Button size="sm" onClick={onCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New build
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Build</TableHead>
                            <TableHead>Components</TableHead>
                            <TableHead>Estimated total</TableHead>
                            <TableHead>Listing</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {builds.length ? (
                            builds.map((build) => (
                                <TableRow key={build.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {build.name}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                STATUS_BADGE[build.status] ?? ''
                                            }
                                        >
                                            {build.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {build.items.length} parts
                                    </TableCell>
                                    <TableCell>
                                        {formatPrice(
                                            build.estimated_total_price,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {build.listing ? (
                                            build.listing.is_published ? (
                                                <Badge>Published</Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Draft
                                                </Badge>
                                            )
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Not listed
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onView(build)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => onList(build)}
                                        >
                                            <Tag className="mr-2 h-4 w-4" />
                                            {build.listing
                                                ? 'Edit listing'
                                                : 'List'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No builds yet. Create one in the “Build a PC”
                                    tab.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function PCBuilder() {
    const { products, builds, flash } = usePage<PageProps>().props;
    const toast = useToast();

    const [tab, setTab] = React.useState('saved');
    const [detailsBuild, setDetailsBuild] = React.useState<Build | null>(null);
    const [listingBuild, setListingBuild] = React.useState<Build | null>(null);

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error, toast]);

    const productsByCategory = React.useMemo(() => {
        const map: Record<string, Product[]> = {};
        (products ?? []).forEach((p) => {
            const cat = getCategoryTitle(p);
            (map[cat] ??= []).push(p);
        });
        return map;
    }, [products]);

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
                                    <BreadcrumbPage>PC Builder</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="p-4">
                    <Tabs value={tab} onValueChange={setTab} className="w-full">
                        <TabsList className="grid w-[320px] grid-cols-2">
                            <TabsTrigger value="saved">
                                PC Builds
                                {builds?.length ? (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2"
                                    >
                                        {builds.length}
                                    </Badge>
                                ) : null}
                            </TabsTrigger>
                            <TabsTrigger value="build">
                                <Cpu className="mr-2 h-4 w-4" />
                                Build a PC
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="saved" className="mt-4">
                            <SavedBuilds
                                builds={builds ?? []}
                                onView={setDetailsBuild}
                                onList={setListingBuild}
                                onCreate={() => setTab('build')}
                            />
                        </TabsContent>

                        <TabsContent value="build" className="mt-4">
                            <BuildCreator
                                productsByCategory={productsByCategory}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <BuildDetailsDialog
                    build={detailsBuild}
                    onClose={() => setDetailsBuild(null)}
                />
                <ListBuildDialog
                    build={listingBuild}
                    onClose={() => setListingBuild(null)}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}
