'use client';

import * as React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { ShieldCheck, UserCog, UserPlus, Users as UsersIcon } from 'lucide-react';

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

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    contact_no: string | null;
    created_at: string | null;
};

type Stats = {
    total: number;
    admins: number;
    staff: number;
    inactive: number;
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

const ROLE_BADGE: Record<string, string> = {
    'super-admin':
        'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    staff: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
};

const ROLE_LABEL: Record<string, string> = {
    'super-admin': 'Super Admin',
    admin: 'Admin',
    staff: 'Staff',
};

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

function AddUserDialog() {
    const [open, setOpen] = React.useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_no: '',
        role: 'staff',
        password: '',
    });

    const handleOpenChange = (value: boolean) => {
        if (!value) reset();
        setOpen(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/user', {
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
                Add user
            </Button>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add staff or admin</DialogTitle>
                    <DialogDescription>
                        Create a back-office account. The user can sign in
                        immediately with the password you set.
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
                            <Label>Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(v) => setData('role', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs text-red-500">
                                    {errors.role}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Contact number</Label>
                            <Input
                                value={data.contact_no}
                                onChange={(e) =>
                                    setData('contact_no', e.target.value)
                                }
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Password</Label>
                        <Input
                            type="text"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Min. 8 characters"
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500">
                                {errors.password}
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
                            {processing ? 'Saving…' : 'Create account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Users() {
    const page = usePage<{
        users: PaginatedData<ManagedUser>;
        stats: Stats;
        auth?: { user?: { id?: number } | null };
        flash?: { success?: string | null; error?: string | null };
    }>();
    const { users, stats, auth, flash } = page.props;

    const toast = useToast();
    const currentUserId = auth?.user?.id;

    const queryParams = React.useMemo(
        () => new URLSearchParams(page.url.split('?')[1] ?? ''),
        [page.url],
    );
    const currentSearch = queryParams.get('search') ?? '';
    const currentRole = queryParams.get('role') ?? 'all';

    const [search, setSearch] = React.useState(currentSearch);
    const [role, setRole] = React.useState(currentRole);

    const rows = users?.data ?? [];
    const perPage = Number(users?.per_page ?? 25);

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error, toast]);

    const visit = React.useCallback(
        (
            overrides: {
                search?: string;
                role?: string;
                page?: number;
                perPage?: number;
            } = {},
        ) => {
            const nextSearch = overrides.search ?? search;
            const nextRole = overrides.role ?? role;
            const nextPage = overrides.page ?? users?.current_page ?? 1;
            const nextPerPage = overrides.perPage ?? perPage;

            const data: Record<string, string | number> = {
                page: nextPage,
                per_page: nextPerPage,
            };
            if (nextSearch.trim()) data.search = nextSearch.trim();
            if (nextRole !== 'all') data.role = nextRole;

            router.visit('/admin/users', {
                method: 'get',
                data,
                only: ['users'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [perPage, role, search, users?.current_page],
    );

    React.useEffect(() => {
        if (search === currentSearch) return;
        const id = window.setTimeout(() => visit({ search, page: 1 }), 400);
        return () => window.clearTimeout(id);
    }, [currentSearch, search, visit]);

    const toggleActive = (user: ManagedUser) => {
        router.put(
            `/admin/users/${user.id}/toggle-active`,
            {},
            { preserveScroll: true },
        );
    };

    const pageNumbers = React.useMemo(() => {
        const currentPage = users?.current_page ?? 1;
        const lastPage = users?.last_page ?? 1;
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(lastPage, currentPage + 2);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [users?.current_page, users?.last_page]);

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
                                <BreadcrumbPage>User Management</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-6 p-4">
                    {/* STATS */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Total accounts"
                            value={formatNumber(stats?.total ?? 0)}
                            icon={UsersIcon}
                        />
                        <StatCard
                            label="Admins"
                            value={formatNumber(stats?.admins ?? 0)}
                            icon={ShieldCheck}
                        />
                        <StatCard
                            label="Staff"
                            value={formatNumber(stats?.staff ?? 0)}
                            icon={UserCog}
                        />
                        <StatCard
                            label="Deactivated"
                            value={formatNumber(stats?.inactive ?? 0)}
                            icon={UsersIcon}
                        />
                    </div>

                    {/* TABLE */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Staff & admin accounts</CardTitle>
                            <AddUserDialog />
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                />
                                <Select
                                    value={role}
                                    onValueChange={(value) => {
                                        setRole(value);
                                        visit({ role: value, page: 1 });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All roles
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="staff">
                                            Staff
                                        </SelectItem>
                                        <SelectItem value="super-admin">
                                            Super Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {rows.length ? (
                                        rows.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                                            {initials(u.name)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {u.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {u.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            ROLE_BADGE[u.role] ??
                                                            ''
                                                        }
                                                    >
                                                        {ROLE_LABEL[u.role] ??
                                                            u.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {u.contact_no || (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {u.created_at}
                                                </TableCell>
                                                <TableCell>
                                                    {u.is_active ? (
                                                        <Badge>Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Deactivated
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {u.id === currentUserId ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            You
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                u.is_active
                                                                    ? 'outline'
                                                                    : 'default'
                                                            }
                                                            onClick={() =>
                                                                toggleActive(u)
                                                            }
                                                        >
                                                            {u.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No accounts found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {users?.from ?? 0}-{users?.to ?? 0}{' '}
                                    of {users?.total ?? 0} accounts
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!users?.prev_page_url}
                                        onClick={() =>
                                            visit({
                                                page: Math.max(
                                                    (users?.current_page ?? 1) -
                                                        1,
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
                                                n === users?.current_page
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
                                        disabled={!users?.next_page_url}
                                        onClick={() =>
                                            visit({
                                                page: Math.min(
                                                    (users?.current_page ?? 1) +
                                                        1,
                                                    users?.last_page ?? 1,
                                                ),
                                            })
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
