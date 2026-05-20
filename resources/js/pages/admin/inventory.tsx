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
  { title: "Total SKUs", value: "312" },
  { title: "Stock value", value: "₱4.2M" },
  { title: "Low stock items", value: "7", warn: true },
  { title: "Out of stock", value: "2", danger: true },
]

const filters = ["All", "Low stock", "Serial tracked", "Batch"]

const inventory = [
  {
    sku: "SKU-GPU-4060",
    product: "RTX 4060 8GB",
    category: "GPU",
    stock: 24,
    reserved: 3,
    location: "Shelf B2",
    reorder: 5,
    serial: true,
  },
  {
    sku: "SKU-GPU-4070TI",
    product: "RTX 4070 Ti 12GB",
    category: "GPU",
    stock: 2,
    reserved: 1,
    location: "Shelf B3",
    reorder: 5,
    serial: true,
  },
  {
    sku: "SKU-CPU-R57600",
    product: "Ryzen 5 7600 (65W)",
    category: "CPU",
    stock: 18,
    reserved: 2,
    location: "Shelf A1",
    reorder: 5,
    serial: false,
  },
  {
    sku: "SKU-CPU-I914900K",
    product: "Core i9-14900K",
    category: "CPU",
    stock: 1,
    reserved: 1,
    location: "Shelf A2",
    reorder: 3,
    serial: false,
  },
  {
    sku: "SKU-RAM-16DDR5",
    product: "Crucial 16GB DDR5-4800",
    category: "RAM",
    stock: 8,
    reserved: 0,
    location: "Shelf C1",
    reorder: 10,
    serial: false,
  },
  {
    sku: "SKU-SSD-SAM1TB",
    product: "Samsung 970 EVO 1TB",
    category: "Storage",
    stock: 32,
    reserved: 5,
    location: "Shelf D1",
    reorder: 8,
    serial: false,
  },
  {
    sku: "SKU-MB-Z790",
    product: "ASUS ROG Z790-F",
    category: "Motherboard",
    stock: 3,
    reserved: 0,
    location: "Shelf E2",
    reorder: 5,
    serial: false,
  },
  {
    sku: "SKU-PSU-COR750",
    product: "Corsair RM750x",
    category: "PSU",
    stock: 15,
    reserved: 4,
    location: "Shelf F1",
    reorder: 5,
    serial: false,
  },
  {
    sku: "SKU-LAP-VV15",
    product: "ASUS VivoBook 15 OLED",
    category: "Laptop",
    stock: 12,
    reserved: 1,
    location: "Case 1",
    reorder: 3,
    serial: true,
  },
]

/* -------------------------------------------------------------------------- */
/*                                  COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  variant,
}: {
  title: string
  value: string
  variant?: "warn" | "danger"
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">
          {title}
        </div>

        <div
          className={`mt-2 text-3xl font-bold ${
            variant === "danger"
              ? "text-red-500"
              : variant === "warn"
              ? "text-yellow-500"
              : ""
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function StockBadge({ value }: { value: boolean }) {
  return value ? (
    <Badge>Yes</Badge>
  ) : (
    <span className="text-muted-foreground">—</span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function Inventory() {
  const [activeFilter, setActiveFilter] = React.useState(0)

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
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
                    Inventory
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-4">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <StatCard
                key={s.title}
                title={s.title}
                value={s.value}
                variant={
                  s.danger
                    ? "danger"
                    : s.warn
                    ? "warn"
                    : undefined
                }
              />
            ))}
          </div>

          {/* Table Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Stock levels
              </CardTitle>

              <div className="flex gap-2">
                {filters.map((f, i) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={
                      activeFilter === i
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setActiveFilter(i)
                    }
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>In stock</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reorder at</TableHead>
                    <TableHead>Serial</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">
                        {item.sku}
                      </TableCell>

                      <TableCell>
                        {item.product}
                      </TableCell>

                      <TableCell>
                        {item.category}
                      </TableCell>

                      <TableCell
                        className={
                          item.stock <= item.reorder
                            ? "text-red-500"
                            : item.stock <=
                              item.reorder * 2
                            ? "text-yellow-500"
                            : ""
                        }
                      >
                        {item.stock}
                      </TableCell>

                      <TableCell>
                        {item.reserved}
                      </TableCell>

                      <TableCell>
                        {item.location}
                      </TableCell>

                      <TableCell>
                        {item.reorder}
                      </TableCell>

                      <TableCell>
                        <StockBadge
                          value={item.serial}
                        />
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