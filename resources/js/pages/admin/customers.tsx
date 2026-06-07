'use client';

import * as React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Eye, Mail, MapPin, Phone, UserPlus, Users } from 'lucide-react';

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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

type Customer = {
    id: number;
    name: string;
    email: string;
    contact_no: string | null;
    address: string | null;
    avatar: string | null;
    orders_count: number;
    total_spent: number;
    last_order_at: string | null;
    joined_at: string | null;
};

type Stats = {
    total_customers: number;
    new_this_month: number;
    with_orders: number;
    total_revenue: number;
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

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

const VIP_THRESHOLD = 100000;

function segment(customer: Customer): { label: string; className: string } {
    if (customer.orders_count === 0)
        return {
            label: 'New',
            className:
                'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
        };
    if (customer.total_spent >= VIP_THRESHOLD)
        return {
            label: 'VIP',
            className:
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
        };
    return {
        label: 'Active',
        className:
            'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    };
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between p-5">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-2 text-2xl font-bold">{value}</div>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
    );
}

/* -------------------------------------------------------------------------- */
/*                             ADD CUSTOMER DIALOG                            */
/* -------------------------------------------------------------------------- */

function AddCustomerDialog() {
    const [open, setOpen] = React.useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_no: '',
        address: '',
        password: '',
    });

    const handleOpenChange = (value: boolean) => {
        if (!value) reset();
        setOpen(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/customer', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Button onClick={() => setOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add customer
            </Button>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add customer</DialogTitle>
                    <DialogDescription>
                        Create a customer account. Leave the password blank to
                        auto-generate one.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label>First name</Label>
                            <Input
                                value={data.first_name}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                            />
                            {errors.first_name && (
                                <p className="text-xs text-red-500">
                                    {errors.first_name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Last name</Label>
                            <Input
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                            />
                            {errors.last_name && (
                                <p className="text-xs text-red-500">
                                    {errors.last_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label>Contact number</Label>
                            <Input
                                value={data.contact_no}
                                onChange={(e) =>
                                    setData('contact_no', e.target.value)
                                }
                                placeholder="Optional"
                            />
                            {errors.contact_no && (
                                <p className="text-xs text-red-500">
                                    {errors.contact_no}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Password</Label>
                            <Input
                                type="text"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                placeholder="Auto-generated if blank"
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Address</Label>
                        <Input
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Optional"
                        />
                        {errors.address && (
                            <p className="text-xs text-red-500">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save customer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                            CUSTOMER DETAILS DIALOG                         */
/* -------------------------------------------------------------------------- */

function CustomerDetailsDialog({
    customer,
    onClose,
}: {
    customer: Customer | null;
    onClose: () => void;
}) {
    return (
        <Dialog open={Boolean(customer)} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                {customer && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    {customer.avatar && (
                                        <AvatarImage src={customer.avatar} />
                                    )}
                                    <AvatarFallback>
                                        {initials(customer.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <DialogTitle>{customer.name}</DialogTitle>
                                    <DialogDescription>
                                        Customer since {customer.joined_at}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Orders
                                    </div>
                                    <div className="mt-1 text-lg font-semibold">
                                        {customer.orders_count}
                                    </div>
                                </div>
                                <div className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Lifetime spend
                                    </div>
                                    <div className="mt-1 text-lg font-semibold">
                                        {formatCurrency(customer.total_spent)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-md border p-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {customer.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {customer.contact_no || 'No contact number'}
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    {customer.address || 'No address on file'}
                                </div>
                            </div>

                            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                Last order:{' '}
                                <span className="font-medium text-foreground">
                                    {customer.last_order_at ?? 'No orders yet'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Customers() {
    const page = usePage<{
        customers: PaginatedData<Customer>;
        stats: Stats;
        flash?: { success?: string | null; error?: string | null };
    }>();
    const { customers, stats, flash } = page.props;

    const toast = useToast();

    const queryParams = React.useMemo(
        () => new URLSearchParams(page.url.split('?')[1] ?? ''),
        [page.url],
    );
    const currentSearch = queryParams.get('search') ?? '';

    const [search, setSearch] = React.useState(currentSearch);
    const [detail, setDetail] = React.useState<Customer | null>(null);

    const rows = customers?.data ?? [];
    const perPage = Number(customers?.per_page ?? 25);

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error, toast]);

    const visit = React.useCallback(
        (
            overrides: {
                search?: string;
                page?: number;
                perPage?: number;
            } = {},
        ) => {
            const nextSearch = overrides.search ?? search;
            const nextPage = overrides.page ?? customers?.current_page ?? 1;
            const nextPerPage = overrides.perPage ?? perPage;

            const data: Record<string, string | number> = {
                page: nextPage,
                per_page: nextPerPage,
            };
            if (nextSearch.trim()) data.search = nextSearch.trim();

            router.visit('/admin/customers', {
                method: 'get',
                data,
                only: ['customers'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [customers?.current_page, perPage, search],
    );

    React.useEffect(() => {
        if (search === currentSearch) return;
        const id = window.setTimeout(() => visit({ search, page: 1 }), 400);
        return () => window.clearTimeout(id);
    }, [currentSearch, search, visit]);

    const pageNumbers = React.useMemo(() => {
        const currentPage = customers?.current_page ?? 1;
        const lastPage = customers?.last_page ?? 1;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(lastPage, currentPage + 2);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [customers?.current_page, customers?.last_page]);

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
                                    Admin Portal
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Customers</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-6 p-4">
                    {/* STATS */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Total customers"
                            value={formatNumber(stats?.total_customers ?? 0)}
                            icon={Users}
                        />
                        <StatCard
                            label="New this month"
                            value={formatNumber(stats?.new_this_month ?? 0)}
                            icon={UserPlus}
                        />
                        <StatCard
                            label="With orders"
                            value={formatNumber(stats?.with_orders ?? 0)}
                            icon={Eye}
                        />
                        <StatCard
                            label="Total revenue"
                            value={formatCurrency(stats?.total_revenue ?? 0)}
                            icon={Mail}
                        />
                    </div>

                    {/* TABLE */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Customer list</CardTitle>
                            <AddCustomerDialog />
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email or contact..."
                                className="max-w-sm"
                            />

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">
                                            Orders
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Total spent
                                        </TableHead>
                                        <TableHead>Last order</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Segment</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {rows.length ? (
                                        rows.map((c) => {
                                            const seg = segment(c);
                                            return (
                                                <TableRow key={c.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                {c.avatar && (
                                                                    <AvatarImage
                                                                        src={
                                                                            c.avatar
                                                                        }
                                                                    />
                                                                )}
                                                                <AvatarFallback>
                                                                    {initials(
                                                                        c.name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {c.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {c.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {c.contact_no || (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {c.orders_count}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            c.total_spent,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {c.last_order_at ?? (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {c.joined_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                seg.className
                                                            }
                                                        >
                                                            {seg.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setDetail(c)
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
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
                                                No customers found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {customers?.from ?? 0}-
                                    {customers?.to ?? 0} of{' '}
                                    {customers?.total ?? 0} customers
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
                                            disabled={!customers?.prev_page_url}
                                            onClick={() =>
                                                visit({
                                                    page: Math.max(
                                                        (customers?.current_page ??
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
                                                    n === customers?.current_page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() => visit({ page: n })}
                                            >
                                                {n}
                                            </Button>
                                        ))}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!customers?.next_page_url}
                                            onClick={() =>
                                                visit({
                                                    page: Math.min(
                                                        (customers?.current_page ??
                                                            1) + 1,
                                                        customers?.last_page ?? 1,
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

                <CustomerDetailsDialog
                    customer={detail}
                    onClose={() => setDetail(null)}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}
