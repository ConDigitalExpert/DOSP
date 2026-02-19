import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DOSP - Digital Off-the-Shelf Pharmacist",
  description: "AI-Powered OTC Triage Kiosk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
