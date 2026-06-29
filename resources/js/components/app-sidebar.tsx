"use client"

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { usePage } from "@inertiajs/react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavMenu } from "./nav-menu"

type NavItem = { name: string; url: string }
type NavGroup = { title: string; items: NavItem[] }

const ADMIN_MENU: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", url: "/admin/dashboard" },
      { name: "Reports", url: "/admin/reports" },
      { name: "Notifications", url: "/admin/notifications" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Orders", url: "/admin/orders" },
      { name: "PC Builder", url: "/admin/pc-builder" },
      { name: "Inventory", url: "/admin/inventory" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", url: "/admin/products" },
      { name: "Categories", url: "/admin/categories" },
      { name: "Listings", url: "/admin/listings" },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Payments & Billing", url: "/admin/payments-and-billing" },
      { name: "Customers", url: "/admin/customers" },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "User Management", url: "/admin/users" },
    ],
  },
]

const STAFF_MENU: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", url: "/admin/dashboard" },
      { name: "Reports", url: "/admin/reports" },
      { name: "Notifications", url: "/admin/notifications" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Orders", url: "/admin/orders" },
      { name: "Inventory", url: "/admin/inventory" },
    ],
  },
]

type PageProps = {
  auth?: { user?: { role?: string } | null }
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { auth } = usePage<PageProps>().props
  const role = auth?.user?.role ?? "staff"
  const isStaff = role === "staff"

  const menu = isStaff ? STAFF_MENU : ADMIN_MENU
  const portalLabel = isStaff ? "Staff Portal" : "Admin Portal"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">E-commerce</span>
            <span className="truncate text-xs">{portalLabel}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menu.map((group) => (
          <NavMenu key={group.title} title={group.title} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
