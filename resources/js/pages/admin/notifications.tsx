'use client';

import * as React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    Megaphone,
    PackageCheck,
    Send,
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
import { Textarea } from '@/components/ui/textarea';

type NotificationItem = {
    id: number;
    type: string;
    title: string;
    message: string;
    read_at: string | null;
    created_label: string | null;
    recipient?: string | null;
    recipient_role?: string | null;
};

type PageProps = {
    notifications: NotificationItem[];
    auth?: {
        unread_notifications?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};

const TYPE_STYLES: Record<string, string> = {
    announcement: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    admin_order: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    order_confirmation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    delivery_update: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
};

function typeLabel(type: string): string {
    return type.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function typeIcon(type: string) {
    if (type === 'announcement') return Megaphone;
    if (type === 'admin_order') return PackageCheck;
    return Bell;
}

export default function Notifications() {
    const { notifications, auth, flash } = usePage<PageProps>().props;
    const form = useForm({
        audience: 'customers',
        title: '',
        message: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/admin/notifications', {
            preserveScroll: true,
            onSuccess: () => form.reset('title', 'message'),
        });
    }

    function markRead() {
        router.put('/notifications/read', {}, {
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
                                <BreadcrumbPage>Notifications</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-6 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                Notifications
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Send announcements and monitor order notification activity.
                            </p>
                        </div>
                        <Button variant="outline" onClick={markRead}>
                            <Bell className="h-4 w-4" />
                            Mark my {auth?.unread_notifications ?? 0} unread as read
                        </Button>
                    </div>

                    {(flash?.success || flash?.error) && (
                        <div className="rounded-lg border bg-background px-4 py-3 text-sm">
                            {flash.success ?? flash.error}
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Megaphone className="h-5 w-5" />
                                    New Announcement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <label className="text-sm font-medium" htmlFor="audience">
                                            Audience
                                        </label>
                                        <select
                                            id="audience"
                                            value={form.data.audience}
                                            onChange={(event) => form.setData('audience', event.target.value)}
                                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="customers">Customers</option>
                                            <option value="staff">Admin and staff</option>
                                            <option value="all">Everyone</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <label className="text-sm font-medium" htmlFor="title">
                                            Title
                                        </label>
                                        <Input
                                            id="title"
                                            value={form.data.title}
                                            onChange={(event) => form.setData('title', event.target.value)}
                                            maxLength={120}
                                            required
                                        />
                                        {form.errors.title && (
                                            <p className="text-xs text-destructive">{form.errors.title}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <label className="text-sm font-medium" htmlFor="message">
                                            Message
                                        </label>
                                        <Textarea
                                            id="message"
                                            value={form.data.message}
                                            onChange={(event) => form.setData('message', event.target.value)}
                                            rows={6}
                                            maxLength={1000}
                                            required
                                        />
                                        {form.errors.message && (
                                            <p className="text-xs text-destructive">{form.errors.message}</p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={form.processing} className="w-full">
                                        <Send className="h-4 w-4" />
                                        {form.processing ? 'Sending...' : 'Send Announcement'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Notification Feed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {notifications.length ? (
                                        notifications.map((notification) => {
                                            const Icon = typeIcon(notification.type);

                                            return (
                                                <div
                                                    key={notification.id}
                                                    className="flex gap-3 rounded-lg border p-4"
                                                >
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h2 className="font-medium">{notification.title}</h2>
                                                            <Badge
                                                                variant="outline"
                                                                className={TYPE_STYLES[notification.type] ?? ''}
                                                            >
                                                                {typeLabel(notification.type)}
                                                            </Badge>
                                                            {!notification.read_at && (
                                                                <Badge variant="secondary">Unread</Badge>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {notification.message}
                                                        </p>
                                                        <div className="mt-2 text-xs text-muted-foreground">
                                                            {notification.created_label ?? 'Just now'}
                                                            {notification.recipient && (
                                                                <>
                                                                    {' / '}
                                                                    {notification.recipient}
                                                                    {notification.recipient_role
                                                                        ? ` (${notification.recipient_role})`
                                                                        : ''}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                                            No notification activity yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
