"use client"

import { router, usePage } from "@inertiajs/react"
import { useCallback, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface PaymentItem {
  id: number
  invoice_id: string
  order_code: string
  customer_id: number | null
  customer_name: string | null
  amount: number
  provider: string
  method: string
  paid_at: string
  status: string
}

interface PaginatedPayments {
  data: PaymentItem[]
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
  payments: PaginatedPayments
  [key: string]: unknown
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid:        "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    Partial:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    Installment: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
    Pending:     "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  }
  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {status}
    </Badge>
  )
}

function formatAmount(amount: number) {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function PaymentsBilling() {
  const page = usePage<PageProps>()
  const { payments } = page.props

  const queryParams = useMemo(
    () => new URLSearchParams(page.url.split("?")[1] ?? ""),
    [page.url],
  )

  const perPage = Number(payments?.per_page ?? 25)

  /* ── page number buttons (window of 5) ── */
  const pageNumbers = useMemo(() => {
    const current = payments?.current_page ?? 1
    const last    = payments?.last_page    ?? 1
    const start   = Math.max(1, current - 2)
    const end     = Math.min(last, current + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [payments?.current_page, payments?.last_page])

  /* ── navigation helper ── */
  const visitPayments = useCallback(
    (overrides: { page?: number; perPage?: number } = {}) => {
      const nextPage    = overrides.page    ?? payments?.current_page ?? 1
      const nextPerPage = overrides.perPage ?? perPage

      router.visit("/admin/payments", {
        method: "get",
        data: { page: nextPage, per_page: nextPerPage },
        only: ["payments"],
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
    },
    [payments?.current_page, perPage],
  )

  /* ── summary cards: cash vs e-wallet only ── */
  const summary = useMemo(() => {
    return (payments?.data ?? []).reduce(
      (acc, p) => {
        const m = (p.method ?? "").toLowerCase()
        if (m === "cash") {
          acc.cash += p.amount
        } else if(m === "card") {
          acc.card += p.amount
        }
        else {
          // GCash, Maya, PayMaya, card, etc. → e-wallet / card bucket
          acc.ewallet += p.amount
        }
        acc.total += p.amount
        return acc
      },
      { cash: 0, ewallet: 0, card:0, total: 0 },
    )
  }, [payments])

  const summaryCards = [
    { label: "Cash",              value: formatAmount(summary.cash),    color: "" },
    { label: "GCash / Maya / Card", value: formatAmount(summary.ewallet), color: "text-green-600" },
    { label: "Card", value: formatAmount(summary.card), color: "text-gray-600" },
    { label: "Total collected",   value: formatAmount(summary.total),   color: "text-blue-600" },
  ]

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
                <BreadcrumbLink href="#">Admin Portal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Payments & Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-6 p-4">

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            {summaryCards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-5">
                  <div className="text-sm text-muted-foreground">{c.label}</div>
                  <div className={`mt-2 text-2xl font-bold ${c.color}`}>{c.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent transactions</CardTitle>
              <Button>New invoice</Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Paid at</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payments?.data?.length ? (
                    payments.data.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.invoice_id}</TableCell>
                        <TableCell>{p.order_code}</TableCell>
                        <TableCell>{p.customer_name ?? "—"}</TableCell>
                        <TableCell>{formatAmount(p.amount)}</TableCell>
                        <TableCell>{p.provider}</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.paid_at}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination — mirrors Products page */}
              <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {payments?.from ?? 0}–{payments?.to ?? 0} of {payments?.total ?? 0} transactions
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Rows per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <Select
                      value={String(perPage)}
                      onValueChange={(val) => visitPayments({ perPage: Number(val), page: 1 })}
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
                      disabled={!payments?.prev_page_url}
                      onClick={() => visitPayments({ page: (payments?.current_page ?? 1) - 1 })}
                    >
                      Previous
                    </Button>

                    {pageNumbers.map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={n === payments?.current_page ? "default" : "outline"}
                        onClick={() => visitPayments({ page: n })}
                      >
                        {n}
                      </Button>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!payments?.next_page_url}
                      onClick={() => visitPayments({ page: (payments?.current_page ?? 1) + 1 })}
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
  )
}