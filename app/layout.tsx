import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: {
    default: "OROSHYA APP",
    template: "%s | OROSHYA APP"
  },
  description: "School Fees Management System",
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
        <Toaster richColors position="top-right" closeButton duration={2000}  />
      </body>
    </html>
  );
}
