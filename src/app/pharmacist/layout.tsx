"use client";

import { useAuthStore } from "@/stores/auth-store";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/pharmacist/login") {
      router.replace("/pharmacist/login");
    }
  }, [isAuthenticated, pathname, router]);

  // Show login page without sidebar
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
