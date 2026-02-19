"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PharmacistRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/pharmacist/dashboard");
  }, [router]);
  return null;
}
