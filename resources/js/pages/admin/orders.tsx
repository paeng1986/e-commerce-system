"use client"

import * as React from "react"
import { router, usePage } from "@inertiajs/react"
import { useCallback, useMemo, useState } from "react"
import { Plus, User, Calendar, Hash, ShoppingCart } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type OrderItem = {
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
}

type Order = {
  id: number
  order_code: string
  customer_id: number
  customer_name: string
  no_of_items: number
  total: number
  date: string
  status: string
  items: OrderItem[]
}

type PaginatedData<T> = {
  data: T[]
  current_page: number
  from: number | null
  last_page: number
  next_page_url: string | null
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

interface PageProps {
  orders: PaginatedData<Order>
  [key: string]: unknown
}

/* -------------------------------------------------------------------------- */
/*                               STATUS CONFIG                                */
/* -------------------------------------------------------------------------- */

const STATUS_STYLES: Record<string, string> = {
  Pending:    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400",
  Processing: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400",
  Assembling: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400",
  Ready:      "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400",
  Delivered:  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400",
  Cancelled:  "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400",
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status] ?? ""}>
      {status}
    </Badge>
  )
}

function FilterBar({
  active,
  counts,
  onSelect,
}: {
  active: string
  counts: Record<string, number>
  onSelect: (status: string) => void
}) {
  const statuses = ["All", ...Object.keys(STATUS_STYLES)]

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(status => (
        <Button
          key={status}
          variant={active === status ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(status)}
          className="rounded-full"
        >
          {status} ({counts[status] ?? 0})
        </Button>
      ))}
    </div>
  )
}

function NextStepActions({ status }: { status: string }) {
  const actions: Record<string, { label: string; variant: "default" | "outline" | "destructive" }[]> = {
    Pending:    [{ label: "Start processing",       variant: "default" }, { label: "Cancel order", variant: "destructive" }],
    Processing: [{ label: "Mark as assembling",     variant: "default" }, { label: "Cancel order", variant: "destructive" }],
    Assembling: [{ label: "Mark as ready",          variant: "default" }, { label: "Cancel order", variant: "destructive" }],
    Ready:      [{ label: "Mark as delivered",      variant: "default" }],
    Delivered:  [{ label: "Delivered — no actions", variant: "outline" }],
    Cancelled:  [{ label: "Cancelled — no actions", variant: "outline" }],
  }

  return (
    <>
      {(actions[status] ?? []).map(({ label, variant }) => (
        <Button key={label} variant={variant} size="sm" className="flex-1">
          {label}
        </Button>
      ))}
    </>
  )
}

function OrderModal({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}) {
  if (!order) return null

  const fields = [
    { icon: Hash,     label: "Order code", value: order.order_code },
    { icon: User,     label: "Customer",   value: order.customer_name },
    { icon: Calendar, label: "Date",       value: order.date },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order {order.order_code}</DialogTitle>
          <DialogDescription>Order details and current status</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">

          {/* Status */}
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Info fields */}
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}

          {/* Items table */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ShoppingCart className="h-4 w-4" />
              Items
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs text-right">Qty</TableHead>
                    <TableHead className="text-xs text-right">Unit price</TableHead>
                    <TableHead className="text-xs text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">
                        No items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    order.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{item.product_name}</TableCell>
                        <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                        <TableCell className="text-sm text-right">₱ {Number(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-right">₱ {Number(item.subtotal).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-semibold">₱ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Next step actions */}
          <div className="flex gap-2 pt-4 border-t">
            <NextStepActions status={order.status} />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Orders() {
  const page = usePage<PageProps>()
  const { orders } = page.props

  const queryParams = useMemo(
    () => new URLSearchParams(page.url.split("?")[1] ?? ""),
    [page.url],
  )

  // Read active filter from URL so it survives page navigation
  const activeFilter = queryParams.get("status") ?? "All"
  const perPage = Number(orders?.per_page ?? 25)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  /* ── page number buttons (window of 5) ── */
  const pageNumbers = useMemo(() => {
    const current = orders?.current_page ?? 1
    const last    = orders?.last_page    ?? 1
    const start   = Math.max(1, current - 2)
    const end     = Math.min(last, current + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [orders?.current_page, orders?.last_page])

  /* ── navigation helper (mirrors payments) ── */
  const visitOrders = useCallback(
    (overrides: { page?: number; perPage?: number; status?: string } = {}) => {
      const nextPage    = overrides.page    ?? orders?.current_page ?? 1
      const nextPerPage = overrides.perPage ?? perPage
      const nextStatus  = overrides.status  ?? activeFilter

      router.visit("/admin/orders", {
        method: "get",
        data: {
          page:     nextPage,
          per_page: nextPerPage,
          // Only send status param when it's not "All" — keeps URLs clean
          ...(nextStatus !== "All" ? { status: nextStatus } : {}),
        },
        only: ["orders"],
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
    },
    [orders?.current_page, perPage, activeFilter],
  )

  /* ── filter pill counts (from current page data) ── */
  const counts = useMemo(() => {
    const all = orders?.data ?? []
    const result: Record<string, number> = { All: orders?.total ?? all.length }
    Object.keys(STATUS_STYLES).forEach(s => {
      result[s] = all.filter(o => o.status === s).length
    })
    return result
  }, [orders])

  const handleFilterSelect = (status: string) => {
    // Reset to page 1 whenever the status filter changes
    visitOrders({ status, page: 1 })
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Admin Portal</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4">

          <FilterBar
            active={activeFilter}
            counts={counts}
            onSelect={handleFilterSelect}
          />

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                {activeFilter === "All" ? "All orders" : `${activeFilter} orders`}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({orders?.total ?? 0})
                </span>
              </CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                New walk-in order
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {(orders?.data ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (orders?.data ?? []).map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_code}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.no_of_items}</TableCell>
                          <TableCell>₱ {Number(order.total).toFixed(2)}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell><StatusBadge status={order.status} /></TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ── Pagination — mirrors Payments page ── */}
              <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {orders?.from ?? 0}–{orders?.to ?? 0} of {orders?.total ?? 0} orders
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Rows per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <Select
                      value={String(perPage)}
                      onValueChange={(val) => visitOrders({ perPage: Number(val), page: 1 })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 25, 50, 100].map((v) => (
                          <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!orders?.prev_page_url}
                      onClick={() => visitOrders({ page: (orders?.current_page ?? 1) - 1 })}
                    >
                      Previous
                    </Button>

                    {pageNumbers.map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={n === orders?.current_page ? "default" : "outline"}
                        onClick={() => visitOrders({ page: n })}
                      >
                        {n}
                      </Button>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!orders?.next_page_url}
                      onClick={() => visitOrders({ page: (orders?.current_page ?? 1) + 1 })}
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

      <OrderModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

    </SidebarProvider>
  )
}