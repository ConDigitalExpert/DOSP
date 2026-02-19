"use client";

import { useRouter } from "next/navigation";
import { usePickupStore } from "@/stores/pickup-store";
import { IdleTimeoutModal } from "@/components/kiosk/idle-timeout-modal";
import Image from "next/image";

export default function PickupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { resetPickup } = usePickupStore();

  const handleTimeout = () => {
    resetPickup();
    router.replace("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/dosp-logo.svg" alt="DOSP" width={48} height={48} />
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">DOSP</h1>
            <p className="text-xs text-muted-foreground">Medication Pickup</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
          Kiosk K-001 Online
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl kiosk-page-enter">{children}</div>
      </main>

      <IdleTimeoutModal onTimeout={handleTimeout} enabled={true} />
    </div>
  );
}
