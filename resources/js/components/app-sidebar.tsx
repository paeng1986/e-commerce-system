"use client"

import * as React from "react"
import {
  CreditCard,
  GalleryVerticalEnd,
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  ShoppingCart,
  ToolCase,
  Users,
  Monitor,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavMenu } from "./nav-menu"

const data = {
  overview: [
    {
      name: "📊 Dashboard",
      url: "/admin/dashboard",
    },
  ],

  operations: [
    {
      name: "🛒 Orders",
      url: "/admin/orders",
    },
    {
      name: "🖥️ PC Builder",
      url: "/admin/pc-builder",
    },
    {
      name: "📦 Inventory",
      url: "/admin/inventory",
    },
  ],

  catalog: [
    {
      name: "💻 Products",
      url: "/admin/products",
    },
    {
      name: "🏷️ Categories",
      url: "/admin/categories",
    },
    {
      name: "📋 Listings",
      url: "/admin/listings",
    },
  ],

  finance: [
    {
      name: "💳 Payments & Billing",
      url: "/admin/payments-and-billing",
    },
    {
      name: "👥 Customers",
      url: "/admin/customers",
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              E-commerce
            </span>

            <span className="truncate text-xs">
              Admin Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMenu
          title="Overview"
          items={data.overview}
        />

        <NavMenu
          title="Operations"
          items={data.operations}
        />

        <NavMenu
          title="Catalog"
          items={data.catalog}
        />

        <NavMenu
          title="Finance"
          items={data.finance}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}