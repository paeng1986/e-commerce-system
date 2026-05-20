"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const stats = [
  { label: "Total customers", value: "1,204" },
  { label: "Corporate accounts", value: "38" },
  { label: "VIP / resellers", value: "22" },
  { label: "Active credit", value: "₱320K" },
]

const customers = [
  {
    name: "J. Reyes",
    type: "Retail",
    purchases: 4,
    spent: "₱140,500",
    credit: "₱42,000",
    notes: "Custom build regular",
    status: "Installment",
  },
  {
    name: "TechCorp Inc",
    type: "Corporate",
    purchases: 12,
    spent: "₱842,000",
    credit: "₱135,000",
    notes: "Net-30 account",
    status: "Credit",
  },
  {
    name: "M. Santos",
    type: "Retail",
    purchases: 7,
    spent: "₱195,000",
    credit: "₱0",
    notes: "—",
    status: "Clear",
  },
  {
    name: "K. Tan",
    type: "Reseller",
    purchases: 28,
    spent: "₱1,200,000",
    credit: "₱0",
    notes: "Bulk discounts applied",
    status: "VIP",
  },
  {
    name: "A. Cruz",
    type: "Retail",
    purchases: 2,
    spent: "₱52,400",
    credit: "₱0",
    notes: "—",
    status: "Clear",
  },
  {
    name: "E. Villanueva",
    type: "Retail",
    purchases: 1,
    spent: "₱78,500",
    credit: "₱78,500",
    notes: "New custom build",
    status: "Installment",
  },
]

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Installment:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
    Credit:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    Clear:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    VIP:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  }

  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {status}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function Customers() {
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
                <BreadcrumbPage>
                  Customers
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-6 p-4">

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
              />
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Customer list
              </CardTitle>

              <Button>
                Add customer
              </Button>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Total spent</TableHead>
                    <TableHead>Credit balance</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell className="font-medium">
                        {c.name}
                      </TableCell>

                      <TableCell>
                        {c.type}
                      </TableCell>

                      <TableCell>
                        {c.purchases}
                      </TableCell>

                      <TableCell>
                        {c.spent}
                      </TableCell>

                      <TableCell>
                        {c.credit}
                      </TableCell>

                      <TableCell>
                        {c.notes}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}