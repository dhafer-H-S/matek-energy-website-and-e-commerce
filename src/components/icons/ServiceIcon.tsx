import {
  Sun, Snowflake, Flame, Droplets, Zap, Wrench, Fan, Thermometer, Cable,
  BatteryCharging, ShieldCheck, Home, Building2, Sparkles, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  snowflake: Snowflake,
  flame: Flame,
  droplets: Droplets,
  zap: Zap,
  wrench: Wrench,
  fan: Fan,
  thermometer: Thermometer,
  cable: Cable,
  battery: BatteryCharging,
  "shield-check": ShieldCheck,
  home: Home,
  "building-2": Building2,
  sparkles: Sparkles,
};

export const SERVICE_ICON_OPTIONS = [
  { value: "sun", label: "Solar (Sun)" },
  { value: "snowflake", label: "Cooling (Snowflake)" },
  { value: "flame", label: "Heating (Flame)" },
  { value: "droplets", label: "Hot water (Droplets)" },
  { value: "zap", label: "Electrical (Zap)" },
  { value: "wrench", label: "Maintenance (Wrench)" },
  { value: "fan", label: "Ventilation (Fan)" },
  { value: "thermometer", label: "Thermostat" },
  { value: "cable", label: "Cabling" },
  { value: "battery", label: "Battery / storage" },
  { value: "shield-check", label: "Safety" },
  { value: "home", label: "Home" },
  { value: "building-2", label: "Building" },
  { value: "sparkles", label: "Other" },
];

export function ServiceIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = SERVICE_ICONS[name ?? ""] ?? Wrench;
  return <Icon className={cn("h-7 w-7", className)} strokeWidth={1.5} />;
}
