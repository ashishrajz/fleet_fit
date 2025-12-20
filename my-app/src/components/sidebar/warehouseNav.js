'use client'
import {
  LayoutDashboard,
  Package,
  Truck,
  Bell,
} from "lucide-react";

export const warehouseNav = [
  { label: "Dashboard", href: "/warehouse", icon: LayoutDashboard },
  { label: "Shipments", href: "/warehouse/shipments", icon: Package },
  { label: "Trips", href: "/warehouse/trips", icon: Truck },
  { label: "Notifications", href: "/warehouse/notifications", icon: Bell },
];
