"use client";

import dynamic from "next/dynamic";

const DemoWizard = dynamic(() => import("./demo-wizard"), { ssr: false });

export function DemoWizardLoader() {
  return <DemoWizard />;
}
