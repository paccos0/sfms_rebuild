import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import PWAInstallButton from "@/components/pwa/PWAInstallButton";
import PushRegister from "@/components/pwa/PushRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OROSHYA APP",
    template: "%s | OROSHYA APP"
  },
  description: "School Fees Management System",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icons/icon-192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#2563eb"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" closeButton duration={2000} />
        <ServiceWorkerRegister />
        <PWAInstallButton />
        <PushRegister />
      </body>
    </html>
  );
}