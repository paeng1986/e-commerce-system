"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { router, useForm, usePage } from "@inertiajs/react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/* -------------------------------------------------------------------------- */
/*                                   FORM                                     */
/* -------------------------------------------------------------------------- */

type Product = {
  id: number
  sku: string
  name: string
  brand: string
  specs?: string | null
  cost?: number | string | null
  warranty?: string | number | null
  stock?: number | null
  category?: string | null
}

export default function ListingForm() {
  const { product } = usePage<{ product: Product }>().props

  const { data, setData, post, processing, errors } = useForm({
    product_id: product.id,
    title: "",
    selling_price: "",
    sale_price: "",
    description: "",
    is_published: false,
    seo_slug: "",
    featured_image: [] as File[],
  })

  const addImages = (files: FileList | null) => {
    if (!files?.length) return

    setData("featured_image", [
      ...data.featured_image,
      ...Array.from(files),
    ])
  }

  const removeImage = (index: number) => {
    setData(
      "featured_image",
      data.featured_image.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post("/admin/listing", {
      forceFormData: true,
    })
  }

  const formatCurrency = (value?: number | string | null) => {
    const amount = Number(value ?? 0)

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0)
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-16 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Admin Portal</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create Listing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* FORM CONTENT */}
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">

          <Card>
            <CardHeader>
              <CardTitle>Create Product Listing</CardTitle>
              <p className="text-sm text-muted-foreground">
                {product.sku} · {product.brand} · {product.name}
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* TITLE */}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    placeholder="e.g. RTX 4060 Gaming Bundle"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* PRICES */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Selling Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={data.selling_price}
                      onChange={(e) =>
                        setData("selling_price", e.target.value)
                      }
                    />
                    {errors.selling_price && (
                      <p className="text-xs text-red-500">
                        {errors.selling_price}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={data.sale_price}
                      onChange={(e) => setData("sale_price", e.target.value)}
                    />
                    {errors.sale_price && (
                      <p className="text-xs text-red-500">{errors.sale_price}</p>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Short description of the product..."
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* SEO SLUG */}
                <div className="space-y-2">
                  <Label>SEO Slug</Label>
                  <Input
                    value={data.seo_slug}
                    onChange={(e) => setData("seo_slug", e.target.value)}
                    placeholder="auto-generated-or-custom-slug"
                  />
                  {errors.seo_slug && (
                    <p className="text-xs text-red-500">{errors.seo_slug}</p>
                  )}
                </div>

                {/* FEATURED IMAGES */}
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Images</Label>

                  <Input
                    id="featured_image"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => addImages(e.target.files)}
                  />

                  <div className="flex gap-2 flex-wrap pt-2">
                    {data.featured_image.map((image, i) => (
                      <div key={i} className="relative">
                        <img
                          alt={image.name}
                          src={URL.createObjectURL(image)}
                          className="w-20 h-20 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.featured_image && (
                    <p className="text-xs text-red-500">
                      {errors.featured_image}
                    </p>
                  )}
                </div>

                {/* PUBLISH STATUS */}
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <p className="font-medium">Publish Listing</p>
                    <p className="text-sm text-muted-foreground">
                      Make this listing visible on the storefront
                    </p>
                  </div>

                  <Switch
                    checked={data.is_published}
                    onCheckedChange={(val) => setData("is_published", val)}
                  />
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit("/admin/listings")}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={processing}>
                    {processing ? "Saving..." : "Save Listing"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Product Details</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Source product for this listing
                    </p>
                  </div>

                  <Badge variant={product.stock && product.stock > 0 ? "outline" : "secondary"}>
                    {product.stock && product.stock > 0 ? "In stock" : "No stock"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-md border bg-muted/30 p-4">
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    {product.sku}
                  </div>
                  <div className="mt-1 text-lg font-semibold leading-tight">
                    {product.name}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{product.brand || "No brand"}</Badge>
                    <Badge variant="outline">{product.category || "Uncategorized"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Cost</div>
                    <div className="mt-1 font-medium">
                      {formatCurrency(product.cost)}
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Stock</div>
                    <div className="mt-1 font-medium">{product.stock ?? 0}</div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Warranty</div>
                    <div className="mt-1 font-medium">
                      {product.warranty || "None"}
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Product ID</div>
                    <div className="mt-1 font-medium">#{product.id}</div>
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Specs</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {product.specs || "No specs recorded for this product."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
