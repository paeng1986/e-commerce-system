import * as React from "react"
import { Plus, Pencil } from "lucide-react"

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
} from "@/components/ui/card"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { usePage, useForm } from "@inertiajs/react"
import { useToast } from "@/context/ToastContext"

type ProductCategory = {
  id: number
  title: string
  description: string | null
  count: number
}

export default function Orders() {
  const { categories } = usePage<{ categories: ProductCategory[] }>().props

  const toast = useToast()

  const [editing, setEditing] = React.useState<ProductCategory | null>(null)
  const [open, setOpen] = React.useState(false)

  const { data, setData, post, put, reset, processing, errors, clearErrors } =
    useForm({
      title: "",
      description: "",
    })

  const openCreate = () => {
    reset()
    clearErrors()
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (cat: ProductCategory) => {
    reset()
    clearErrors()

    setEditing(cat)
    setData({
      title: cat.title,
      description: cat.description ?? "",
    })

    setOpen(true)
  }
    const submit = (e: React.FormEvent) => {
    e.preventDefault()

    const options = {
      onSuccess: () => {
        toast.success(
          editing ? "Category updated" : "Category created",
          { duration: 3000 }
        )

        reset()
        clearErrors()
        setOpen(false)
      },

      onError: () => {
        toast.error("Please fix the errors", {
          duration: 3000,
        })
      },
    }

    if (editing) {
      put(`/admin/categories/${editing.id}`, options)
    } else {
      post("/admin/categories", options)
    }
  }

    return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>Admin Portal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Categories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4">

          {/* ADD */}
          <div className="flex justify-end">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {/* GRID */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="h-full min-h-[160px] flex flex-col justify-between hover:bg-muted/40 transition"
              >
                <CardContent className="flex flex-col justify-between p-4 h-full">

                  <div>
                    <div className="text-sm font-medium">
                      {cat.title}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {cat.description}
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                      {cat.count} products
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
                    <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={submit} className="space-y-4">

                {/* TITLE */}
                <div>
                  <Input
                    placeholder="Category Title"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                  />

                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <Textarea
                    placeholder="Description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                  />

                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={processing}>
                    {editing ? "Update" : "Create"}
                  </Button>
                </div>

              </form>
            </DialogContent>
          </Dialog>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}