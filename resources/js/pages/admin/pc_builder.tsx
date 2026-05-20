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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const templates = [
  {
    name: "Budget Build — ₱28,000",
    status: "Available",
    parts: [
      "Ryzen 5 5600",
      "GTX 1660 Super",
      "16GB DDR4",
      "512GB SSD",
      "550W PSU",
      "B450 Mobo",
    ],
  },
  {
    name: "Gaming Build — ₱65,000",
    status: "Available",
    parts: [
      "Ryzen 7 7700X",
      "RTX 4070",
      "32GB DDR5",
      "1TB NVMe",
      "750W PSU",
      "X670E Mobo",
    ],
  },
  {
    name: "Workstation — ₱120,000",
    status: "Partial stock",
    variant: "warning",
    parts: [
      "Core i9-14900K",
      "RTX 4090",
      "64GB DDR5",
      "2TB NVMe",
      "1000W PSU",
      "Z790 Mobo",
    ],
  },
]

const queue = [
  {
    build: "#ORD-1042",
    tech: "R. Mendoza",
    eta: "Today 4PM",
    status: "Assembling",
  },
  {
    build: "#ORD-1037",
    tech: "D. Garcia",
    eta: "Done",
    status: "Ready",
  },
  {
    build: "#ORD-1035",
    tech: "R. Mendoza",
    eta: "May 17",
    status: "Queued",
  },
  {
    build: "#ORD-1033",
    tech: "J. Bautista",
    eta: "May 18",
    status: "Queued",
  },
]

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Assembling:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    Ready:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    Queued:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  }

  return (
    <Badge className={styles[status] ?? ""} variant="outline">
      {status}
    </Badge>
  )
}

function TemplateCard({
  name,
  status,
  parts,
  variant,
}: {
  name: string
  status: string
  parts: string[]
  variant?: "warning"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          {name}
        </CardTitle>

        <Badge
          variant="outline"
          className={
            variant === "warning"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20"
              : "bg-green-100 text-green-700 dark:bg-green-500/20"
          }
        >
          {status}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        {parts.map((p) => (
          <span
            key={p}
            className="rounded-full bg-muted px-2 py-1 text-xs"
          >
            {p}
          </span>
        ))}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function PCBuilder() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b px-4">
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
                  PC Builder
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-6 p-4">

          {/* Top Grid */}
          <div className="grid gap-4 xl:grid-cols-2">

            {/* Templates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Build templates
                </CardTitle>

                <Button size="sm">
                  New template
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {templates.map((t) => (
                  <TemplateCard
                    key={t.name}
                    name={t.name}
                    status={t.status}
                    parts={t.parts}
                    variant={
                      t.variant as any
                    }
                  />
                ))}
              </CardContent>
            </Card>

            {/* Queue + Compatibility */}
            <div className="space-y-4">

              {/* Queue */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Assembly queue
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="pb-2">
                            Build
                          </th>
                          <th className="pb-2">
                            Technician
                          </th>
                          <th className="pb-2">
                            ETA
                          </th>
                          <th className="pb-2">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {queue.map((q) => (
                          <tr
                            key={q.build}
                            className="border-t"
                          >
                            <td className="py-2">
                              {q.build}
                            </td>

                            <td>{q.tech}</td>

                            <td>{q.eta}</td>

                            <td>
                              <StatusBadge
                                status={q.status}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Compatibility */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Compatibility checker
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select parts to verify CPU socket, PSU wattage, RAM type
                  </p>

                  <Button className="w-full">
                    Check parts compatibility
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}