"use client";

import { type KioskInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Monitor, Wifi, WifiOff, User } from "lucide-react";

interface KioskStatusCardProps {
  kiosk: KioskInfo;
}

export function KioskStatusCard({ kiosk }: KioskStatusCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-white">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          kiosk.status === "online" && "bg-success/10",
          kiosk.status === "in_use" && "bg-primary/10",
          kiosk.status === "offline" && "bg-muted"
        )}
      >
        <Monitor
          className={cn(
            "w-6 h-6",
            kiosk.status === "online" && "text-success",
            kiosk.status === "in_use" && "text-primary",
            kiosk.status === "offline" && "text-muted-foreground"
          )}
        />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{kiosk.name}</p>
        <p className="text-xs text-muted-foreground">{kiosk.location}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {kiosk.status === "online" && <Wifi className="w-4 h-4 text-success" />}
        {kiosk.status === "in_use" && <User className="w-4 h-4 text-primary" />}
        {kiosk.status === "offline" && <WifiOff className="w-4 h-4 text-muted-foreground" />}
        <span
          className={cn(
            "text-xs font-medium capitalize",
            kiosk.status === "online" && "text-success",
            kiosk.status === "in_use" && "text-primary",
            kiosk.status === "offline" && "text-muted-foreground"
          )}
        >
          {kiosk.status.replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
}
