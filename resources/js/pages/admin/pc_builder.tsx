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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { usePage } from "@inertiajs/react"
import { useState, useMemo, useEffect } from "react"

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Product = {
  id: number
  sku: string
  name: string
  brand: string
  keys: string
  specs: string
  cost: number | string
  warranty: string | number
  stock: number
  category: { title: string } | string | any
}

type PageProps = {
  products: Product[]
}

type Template = {
  name: string
  status: "Available" | "Partial stock" | "Unavailable"
  parts: string[]
  variant?: "warning" | "danger"
}

/* -------------------------------------------------------------------------- */
/*                               CATEGORY CONFIG                              */
/* -------------------------------------------------------------------------- */

const CATEGORY_CONFIG: Record<string, { label: string; max: number }> = {
  CPU:         { label: "CPU",         max: 1 },
  GPU:         { label: "GPU",         max: 1 },
  Motherboard: { label: "Motherboard", max: 1 },
  RAM:         { label: "RAM",         max: 2 },
  Storage:     { label: "Storage",     max: 3 },
  PSU:         { label: "PSU",         max: 1 },
  Monitor:     { label: "Monitor",     max: 2 },
  Peripheral:  { label: "Peripheral",  max: 4 },
  Laptop:      { label: "Laptop",      max: 2 },
}

const CATEGORY_ORDER = [
  "CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Monitor", "Peripheral", "Laptop",
]

/* -------------------------------------------------------------------------- */
/*                                STATIC DATA                                 */
/* -------------------------------------------------------------------------- */

const initialTemplates: Template[] = [
  {
    name: "Budget Build — ₱28,000",
    status: "Available",
    parts: ["Ryzen 5 5600", "GTX 1660 Super", "16GB DDR4", "512GB SSD", "550W PSU", "B450 Mobo"],
  },
  {
    name: "Gaming Build — ₱65,000",
    status: "Available",
    parts: ["Ryzen 7 7700X", "RTX 4070", "32GB DDR5", "1TB NVMe", "750W PSU", "X670E Mobo"],
  },
  {
    name: "Workstation — ₱120,000",
    status: "Partial stock",
    variant: "warning",
    parts: ["Core i9-14900K", "RTX 4090", "64GB DDR5", "2TB NVMe", "1000W PSU", "Z790 Mobo"],
  },
]

const queue = [
  { build: "#ORD-1042", tech: "R. Mendoza", eta: "Today 4PM", status: "Assembling" },
  { build: "#ORD-1037", tech: "D. Garcia",  eta: "Done",      status: "Ready"      },
  { build: "#ORD-1035", tech: "R. Mendoza", eta: "May 17",    status: "Queued"     },
  { build: "#ORD-1033", tech: "J. Bautista",eta: "May 18",    status: "Queued"     },
]

/* -------------------------------------------------------------------------- */
/*                               HELPER FNS                                   */
/* -------------------------------------------------------------------------- */

function getCategoryTitle(product: Product): string {
  if (!product.category) return "Other"
  if (typeof product.category === "string") return product.category
  if (typeof product.category === "object" && product.category.title) return product.category.title
  return "Other"
}

/** Safely parse cost — handles string "1500.00", number 1500, etc. */
function parseCost(cost: number | string | undefined | null): number {
  if (cost === null || cost === undefined) return 0
  const parsed = parseInt(String(cost), 10)
  return isNaN(parsed) ? 0 : parsed
}

function formatPrice(n: number) {
  return "₱" + n.toLocaleString("en-PH")
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Assembling: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    Ready:      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    Queued:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  }
  return (
    <Badge className={styles[status] ?? ""} variant="outline">
      {status}
    </Badge>
  )
}

function TemplateCard({
  name, status, parts, variant,
}: {
  name: string
  status: string
  parts: string[]
  variant?: "warning" | "danger"
}) {
  const badgeClass =
    variant === "danger"
      ? "bg-red-100 text-red-700 dark:bg-red-500/20"
      : variant === "warning"
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20"
      : "bg-green-100 text-green-700 dark:bg-green-500/20"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{name}</CardTitle>
        <Badge variant="outline" className={badgeClass}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {parts.map((p) => (
          <span key={p} className="rounded-full bg-muted px-2 py-1 text-xs">
            {p}
          </span>
        ))}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                          TEMPLATE CREATOR MODAL                            */
/* -------------------------------------------------------------------------- */

function TemplateCreatorModal({
  open,
  onClose,
  onSave,
  productsByCategory,
}: {
  open: boolean
  onClose: () => void
  onSave: (template: Template) => void
  productsByCategory: Record<string, Product[]>
}) {
  const [name, setName] = useState("")
  const [status, setStatus] = useState<Template["status"]>("Available")
  const [slots, setSlots] = useState<Record<string, (number | null)[]>>(
    () => Object.fromEntries(CATEGORY_ORDER.map((k) => [k, [null]]))
  )

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const selectedProducts = useMemo(() => {
    const results: Product[] = []
    CATEGORY_ORDER.forEach((cat) => {
      ;(slots[cat] || []).forEach((id) => {
        if (id == null) return
        const prod = (productsByCategory[cat] || []).find((p) => p.id === id)
        if (prod) results.push(prod)
      })
    })
    return results
  }, [slots, productsByCategory])

  const total = selectedProducts.reduce((s, p) => s + parseCost(p.cost), 0)

  function setSlot(cat: string, idx: number, val: number | null) {
    setSlots((prev) => {
      const arr = [...(prev[cat] || [null])]
      arr[idx] = val
      return { ...prev, [cat]: arr }
    })
  }

  function addSlot(cat: string) {
    const cfg = CATEGORY_CONFIG[cat]
    setSlots((prev) => {
      const arr = prev[cat] || [null]
      if (arr.length >= (cfg?.max ?? 1)) return prev
      return { ...prev, [cat]: [...arr, null] }
    })
  }

  function removeSlot(cat: string, idx: number) {
    setSlots((prev) => {
      const arr = [...(prev[cat] || [])]
      arr.splice(idx, 1)
      return { ...prev, [cat]: arr.length ? arr : [null] }
    })
  }

  function handleSave() {
    if (!name.trim() || selectedProducts.length === 0) return
    const variant =
      status === "Unavailable" ? "danger" : status === "Partial stock" ? "warning" : undefined
    onSave({
      name: `${name.trim()} — ${formatPrice(total)}`,
      status,
      parts: selectedProducts.map((p) => p.name),
      variant,
    })
    handleClose()
  }

  function handleClose() {
    setName("")
    setStatus("Available")
    setSlots(Object.fromEntries(CATEGORY_ORDER.map((k) => [k, [null]])))
    onClose()
  }

  const activeCategories = CATEGORY_ORDER.filter(
    (cat) => (productsByCategory[cat]?.length ?? 0) > 0
  )

  if (!open) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Modal panel — control width here */}
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border bg-background shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold">New build template</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-5">

          {/* Name + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Template name</Label>
              <Input
                placeholder="e.g. Gaming Build"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Template["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Partial stock">Partial stock</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated total */}
          {selectedProducts.length > 0 && (
            <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated total</span>
              <span className="font-semibold text-base">{formatPrice(total)}</span>
            </div>
          )}

          {/* Category slots */}
          <div className="space-y-4">
            {activeCategories.map((cat) => {
              const products = productsByCategory[cat] || []
              const cfg = CATEGORY_CONFIG[cat] ?? { label: cat, max: 1 }
              const catSlots = slots[cat] || [null]

              return (
                <div key={cat} className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    {cfg.label}
                  </Label>

                  {catSlots.map((selectedId, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select
                        value={selectedId?.toString() ?? ""}
                        onValueChange={(v) => setSlot(cat, idx, v ? parseInt(v) : null)}
                      >
                        <SelectTrigger className="flex-1 text-sm">
                          <SelectValue placeholder={`Select ${cfg.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              <div className="flex items-center justify-between w-full gap-6">
                                <span>{p.brand} {p.name}</span>
                                <span className="text-muted-foreground text-xs shrink-0">
                                  {formatPrice(parseCost(p.cost))} · Stock: {p.stock}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {catSlots.length > 1 && (
                        <button
                          onClick={() => removeSlot(cat, idx)}
                          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-base"
                          aria-label="Remove slot"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {catSlots.length < cfg.max && (
                    <button
                      onClick={() => addSlot(cat)}
                      className="w-full h-8 text-xs text-muted-foreground border border-dashed rounded-md hover:bg-muted transition-colors"
                    >
                      + Add another {cfg.label}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-6 py-4 shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || selectedProducts.length === 0}
          >
            Save template
          </Button>
        </div>

      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function PCBuilder() {
  const { products } = usePage<PageProps>().props
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [modalOpen, setModalOpen] = useState(false)

  const productsByCategory = useMemo(() => {
    const map: Record<string, Product[]> = {}
    products.forEach((p) => {
      const cat = getCategoryTitle(p)
      if (!map[cat]) map[cat] = []
      map[cat].push(p)
    })
    return map
  }, [products])

  function handleSaveTemplate(template: Template) {
    setTemplates((prev) => [...prev, template])
  }

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
                <BreadcrumbPage>PC Builder</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-6 p-4">
          <div className="grid gap-4 xl:grid-cols-2">

            {/* Templates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Build templates</CardTitle>
                <Button size="sm" onClick={() => setModalOpen(true)}>
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
                    variant={t.variant}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Queue + Compatibility */}
            <div className="space-y-4">

              <Card>
                <CardHeader>
                  <CardTitle>Assembly queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="pb-2">Build</th>
                          <th className="pb-2">Technician</th>
                          <th className="pb-2">ETA</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queue.map((q) => (
                          <tr key={q.build} className="border-t">
                            <td className="py-2">{q.build}</td>
                            <td>{q.tech}</td>
                            <td>{q.eta}</td>
                            <td><StatusBadge status={q.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compatibility checker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select parts to verify CPU socket, PSU wattage, RAM type
                  </p>
                  <Button className="w-full">Check parts compatibility</Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        <TemplateCreatorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTemplate}
          productsByCategory={productsByCategory}
        />

      </SidebarInset>
    </SidebarProvider>
  )
}