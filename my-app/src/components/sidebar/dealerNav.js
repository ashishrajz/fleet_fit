'use client'
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Bell,
  CircleUserRound,
  History
} from "lucide-react";
import { FaTruckFast } from "react-icons/fa6";

export const dealerNav = [
  { label: "Dashboard", href: "/dealer", icon: LayoutDashboard },
  { label: "Trucks", href: "/dealer/trucks", icon: FaTruckFast },
  { label: "Requests", href: "/dealer/requests", icon: ClipboardList },
  { label: "Manage Trips", href: "/dealer/trips", icon: Truck },
  { label: "Profile", href: "/dealer/profile", icon: CircleUserRound },
  { label: "Notifications", href: "/dealer/notifications", icon: Bell },
  { label: "History", href: "/dealer/history", icon: History },
];
