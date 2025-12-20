'use client'
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Bell,
} from "lucide-react";

export const dealerNav = [
  { label: "Dashboard", href: "/dealer", icon: LayoutDashboard },
  { label: "Trucks", href: "/dealer/trucks", icon: Truck },
  { label: "Requests", href: "/dealer/requests", icon: ClipboardList },
  { label: "Trips", href: "/dealer/trips", icon: Truck },
  { label: "Notifications", href: "/dealer/notifications", icon: Bell },
];
