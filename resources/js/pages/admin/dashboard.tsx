import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  Calendar,
} from "lucide-react"

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Progress } from "@/components/ui/progress"

import { Separator } from "@/components/ui/separator"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Today's sales",
    value: "₱84,200",
    description: "+12% vs yesterday",
    positive: true,
  },
  {
    title: "Monthly revenue",
    value: "₱1.84M",
    description: "+8% vs last month",
    positive: true,
  },
  {
    title: "Pending orders",
    value: "12",
    description: "4 assembling now",
  },
  {
    title: "Low stock alerts",
    value: "7",
    description: "3 critical items",
    danger: true,
  },
]

const topSelling = [
  { name: "RTX 4060", units: 88 },
  { name: "Ryzen 5 7600", units: 72 },
  { name: "32GB DDR5", units: 65 },
  { name: "Samsung 1TB", units: 58 },
  { name: "Corsair 650W", units: 44 },
]

const stockAlerts = [
  {
    name: "RTX 4070 Ti",
    label: "GPU · SKU-GPU-4070TI",
    qty: "2 left",
    critical: true,
  },
  {
    name: "Core i9-14900K",
    label: "CPU · SKU-CPU-I914900K",
    qty: "1 left",
    critical: true,
  },
  {
    name: "ASUS Z790 Motherboard",
    label: "Motherboard · SKU-MB-Z790",
    qty: "3 left",
    critical: true,
  },
  {
    name: "Crucial 16GB DDR5",
    label: "RAM · SKU-RAM-16DDR5",
    qty: "8 left",
    critical: false,
  },
]

const recentOrders = [
  {
    order: "#ORD-1042",
    customer: "J. Reyes",
    type: "Custom Build",
    total: "₱62,000",
    status: "Assembling",
  },
  {
    order: "#ORD-1041",
    customer: "M. Santos",
    type: "GPU Purchase",
    total: "₱28,500",
    status: "Ready",
  },
  {
    order: "#ORD-1040",
    customer: "TechCorp Inc",
    type: "Bulk — 5 units",
    total: "₱185,000",
    status: "Pending",
  },
]

const deliveries = [
  {
    name: "ASUS PH — 20 items",
    date: "Arriving May 18",
  },
  {
    name: "Intel Distributor — 15 CPUs",
    date: "Arriving May 20",
  },
  {
    name: "Kingston — 50 RAM sticks",
    date: "Arriving May 22",
  },
]

/* -------------------------------------------------------------------------- */
/*                                  COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function DashboardCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">
          {title}
        </CardTitle>

        {action}
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function StatCard({
  title,
  value,
  description,
  positive,
  danger,
}: {
  title: string
  value: string
  description: string
  positive?: boolean
  danger?: boolean
}) {
  return (
    <DashboardCard title={title}>
      <div className="space-y-2">
        <div
          className={`text-3xl font-bold ${
            danger ? "text-red-500" : ""
          }`}
        >
          {value}
        </div>

        <div
          className={`flex items-center gap-1 text-sm ${
            positive
              ? "text-green-500"
              : danger
              ? "text-red-500"
              : "text-muted-foreground"
          }`}
        >
          {positive && (
            <ArrowUp className="h-3.5 w-3.5" />
          )}

          {description}
        </div>
      </div>
    </DashboardCard>
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const variants: Record<string, string> = {
    Ready:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",

    Pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",

    Cancelled:
      "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",

    Assembling:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  }

  return (
    <Badge
      className={variants[status]}
      variant="outline"
    >
      {status}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />

            <Separator
              orientation="vertical"
              className="h-4"
            />

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
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4">

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <StatCard
                key={item.title}
                title={item.title}
                value={item.value}
                description={item.description}
                positive={item.positive}
                danger={item.danger}
              />
            ))}
          </div>

          {/* Top + Alerts */}
          <div className="grid gap-6 xl:grid-cols-2">

            <DashboardCard
              title="Top-selling components"
              action={
                <button className="text-sm text-primary hover:underline">
                  View catalog →
                </button>
              }
            >
              <div className="space-y-5">
                {topSelling.map((item) => (
                  <div
                    key={item.name}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>

                      <span className="text-muted-foreground">
                        {item.units} units
                      </span>
                    </div>

                    <Progress value={item.units} />
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard title="Critical stock alerts">
              <div className="space-y-4">
                {stockAlerts.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between rounded-xl border p-4"
                  >
                    <div className="flex gap-3">
                      {item.critical ? (
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                      )}

                      <div>
                        <div className="font-medium">
                          {item.name}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {item.label}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-medium">
                      {item.qty}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Orders + Deliveries */}
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">

            <DashboardCard
              title="Recent orders"
              action={
                <button className="text-sm text-primary hover:underline">
                  All orders →
                </button>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.order}>
                      <TableCell>
                        {order.order}
                      </TableCell>

                      <TableCell>
                        {order.customer}
                      </TableCell>

                      <TableCell>
                        {order.type}
                      </TableCell>

                      <TableCell className="font-medium">
                        {order.total}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={order.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>

            <DashboardCard title="Incoming deliveries">
              <div className="space-y-4">
                {deliveries.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border p-4"
                  >
                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />

                      {item.date}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}