'use client'
import {
  LayoutDashboard,
  Package,
  Truck,
  Bell,
  CirclePlus,
  History,
  CircleUserRound

} from "lucide-react";

export const warehouseNav = [
  { label: "Dashboard", href: "/warehouse", icon: LayoutDashboard },
  { label: "Shipments", href: "/warehouse/shipments", icon: CirclePlus },
  { label: "Manage Trips", href: "/warehouse/trips", icon: Truck },
  { label: "Notifications", href: "/warehouse/notifications", icon: Bell },
  { label: "Profile", href: "/warehouse/profile", icon: CircleUserRound },
  { label: "History", href: "/warehouse/history", icon: History },
];
