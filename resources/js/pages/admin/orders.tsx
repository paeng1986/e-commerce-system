"use client"

import * as React from "react"
import { router, usePage } from "@inertiajs/react"
import { useCallback, useMemo, useState } from "react"
import { Plus, User, Calendar, Hash, ShoppingCart, CheckCircle2, Circle, XCircle, Loader2 } from "lucide-react"
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
/*                         STATUS TRANSITION MAP                              */
/* -------------------------------------------------------------------------- */

// What status comes next for each status (null = terminal, no forward step)
const NEXT_STATUS: Record<string, string | null> = {
  Pending:    "Processing",
  Processing: "Assembling",
  Assembling: "Ready",
  Ready:      "Delivered",
  Delivered:  null,
  Cancelled:  null,
}

// Which statuses can still be cancelled
const CAN_CANCEL = new Set(["Pending", "Processing", "Assembling"])

// Human-readable action labels for the forward button
const NEXT_LABEL: Record<string, string> = {
  Pending:    "Start Processing",
  Processing: "Mark as Assembling",
  Assembling: "Mark as Ready",
  Ready:      "Mark as Delivered",
}

/* -------------------------------------------------------------------------- */
/*                            ORDER PROGRESS TRACKER                          */
/* -------------------------------------------------------------------------- */

const PROGRESS_STEPS = ["Processing", "Assembling", "Ready", "Delivered"] as const
type ProgressStep = typeof PROGRESS_STEPS[number]

const STEP_META: Record<ProgressStep, { label: string; description: string; color: string; dot: string; line: string; ring: string }> = {
  Processing: {
    label: "Processing",
    description: "Order confirmed & being prepared",
    color: "text-orange-600 dark:text-orange-400",
    dot:   "bg-orange-500",
    line:  "bg-orange-400",
    ring:  "ring-orange-300",
  },
  Assembling: {
    label: "Assembling",
    description: "Items are being packed together",
    color: "text-blue-600 dark:text-blue-400",
    dot:   "bg-blue-500",
    line:  "bg-blue-400",
    ring:  "ring-blue-300",
  },
  Ready: {
    label: "Ready",
    description: "Order is ready for pickup / dispatch",
    color: "text-green-600 dark:text-green-400",
    dot:   "bg-green-500",
    line:  "bg-green-400",
    ring:  "ring-green-300",
  },
  Delivered: {
    label: "Delivered",
    description: "Order successfully delivered",
    color: "text-emerald-600 dark:text-emerald-400",
    dot:   "bg-emerald-500",
    line:  "bg-emerald-400",
    ring:  "ring-emerald-300",
  },
}

function OrderProgressTracker({ status }: { status: string }) {
  const isCancelled = status === "Cancelled"
  const currentIndex = PROGRESS_STEPS.indexOf(status as ProgressStep)

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
          <p className="text-xs text-red-500 dark:text-red-400/70 mt-0.5">
            This order has been cancelled and will not be processed further.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Order Progress</p>

      <div className="flex items-start gap-0">
        {PROGRESS_STEPS.map((step, idx) => {
          const isDone    = currentIndex > idx
          const isCurrent = currentIndex === idx
          const meta      = STEP_META[step]
          const isLast    = idx === PROGRESS_STEPS.length - 1

          return (
            <div key={step} className="flex flex-col items-center flex-1">
              {/* Connector row */}
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div className={`h-0.5 flex-1 transition-colors duration-300 ${
                    isDone || isCurrent ? meta.line : "bg-border"
                  }`} />
                )}

                {/* Step dot */}
                <div className={`relative flex items-center justify-center rounded-full shrink-0 transition-all duration-300 ${
                  isDone
                    ? `h-7 w-7 ${meta.dot}`
                    : isCurrent
                    ? `h-8 w-8 ring-4 ring-offset-1 ring-offset-background ${meta.dot} ${meta.ring}`
                    : "h-6 w-6 bg-muted border-2 border-border"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : isCurrent ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </div>

                {!isLast && (
                  <div className={`h-0.5 flex-1 transition-colors duration-300 ${
                    isDone ? STEP_META[PROGRESS_STEPS[idx + 1]].line : "bg-border"
                  }`} />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center px-1">
                <p className={`text-xs font-semibold ${
                  isDone || isCurrent ? meta.color : "text-muted-foreground/50"
                }`}>
                  {meta.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {meta.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
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

/* -------------------------------------------------------------------------- */
/*                               ORDER MODAL                                  */
/* -------------------------------------------------------------------------- */

function OrderModal({
  order,
  open,
  onClose,
  onStatusChange,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
  onStatusChange: (orderId: number, newStatus: string) => void
}) {
  const [loading, setLoading] = useState<"next" | "cancel" | null>(null)

  if (!order) return null

  const fields = [
    { icon: Hash,     label: "Order code", value: order.order_code },
    { icon: User,     label: "Customer",   value: order.customer_name },
    { icon: Calendar, label: "Date",       value: order.date },
  ]

  const nextStatus  = NEXT_STATUS[order.status]
  const canCancel   = CAN_CANCEL.has(order.status)
  const nextLabel   = NEXT_LABEL[order.status]
  const isTerminal  = order.status === "Delivered" || order.status === "Cancelled"

  // PUT /admin/orders/{order}/status
  function updateStatus(newStatus: string, type: "next" | "cancel") {
    setLoading(type)
    router.put(
      `/admin/orders/${order.id}/status`,
      { status: newStatus.toLowerCase() },
      {
        preserveScroll: true,
        preserveState: true,
        only: ["orders"],
        onSuccess: () => {
          onStatusChange(order.id, newStatus)
          setLoading(null)
        },
        onError: () => {
          setLoading(null)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order {order.order_code}</DialogTitle>
          <DialogDescription>Order details and current status</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">

          {/* Status badge */}
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Progress tracker */}
          <OrderProgressTracker status={order.status} />

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

            {/* Total */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-semibold">₱ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-2 pt-4 border-t">
            {isTerminal ? (
              /* Terminal state — show a disabled pill so the row is never empty */
              <Button variant="outline" size="sm" disabled className="flex-1 opacity-50">
                {order.status === "Delivered" ? "Order delivered — no further actions" : "Order cancelled — no further actions"}
              </Button>
            ) : (
              <>
                {/* Forward / next-step button */}
                {nextStatus && (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={loading !== null}
                    onClick={() => updateStatus(nextStatus, "next")}
                  >
                    {loading === "next" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      nextLabel
                    )}
                  </Button>
                )}

                {/* Cancel button — only when cancellation is still allowed */}
                {canCancel && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={loading !== null}
                    onClick={() => updateStatus("Cancelled", "cancel")}
                  >
                    {loading === "cancel" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Cancelling…
                      </>
                    ) : (
                      "Cancel order"
                    )}
                  </Button>
                )}
              </>
            )}
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

  const activeFilter = queryParams.get("status") ?? "All"
  const perPage = Number(orders?.per_page ?? 25)

  // selectedOrder is kept in local state; we update it optimistically on status change
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Called by the modal after a successful status PUT — updates both the modal
  // and the matching row in the table instantly (optimistic UI)
  const handleStatusChange = useCallback((orderId: number, newStatus: string) => {
    setSelectedOrder(prev =>
      prev && prev.id === orderId ? { ...prev, status: newStatus } : prev,
    )
  }, [])

  const pageNumbers = useMemo(() => {
    const current = orders?.current_page ?? 1
    const last    = orders?.last_page    ?? 1
    const start   = Math.max(1, current - 2)
    const end     = Math.min(last, current + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [orders?.current_page, orders?.last_page])

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

  const counts = useMemo(() => {
    const all = orders?.data ?? []
    const result: Record<string, number> = { All: orders?.total ?? all.length }
    Object.keys(STATUS_STYLES).forEach(s => {
      result[s] = all.filter(o => o.status === s).length
    })
    return result
  }, [orders])

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
            onSelect={(status) => visitOrders({ status, page: 1 })}
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
                      (orders?.data ?? []).map(order => {
                        // Show the optimistic status if this row is open in the modal
                        const displayStatus =
                          selectedOrder?.id === order.id
                            ? selectedOrder.status
                            : order.status

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_code}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.no_of_items}</TableCell>
                            <TableCell>₱ {Number(order.total).toFixed(2)}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell><StatusBadge status={displayStatus} /></TableCell>
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
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {orders?.from ?? 0}–{orders?.to ?? 0} of {orders?.total ?? 0} orders
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        onStatusChange={handleStatusChange}
      />

    </SidebarProvider>
  )
}