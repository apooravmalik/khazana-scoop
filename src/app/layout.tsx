import type { Metadata } from "next";
import { SmoothScrollController } from "@/components/smooth-scroll-controller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khazana Scoop",
  description: "Shop Khazana Scoop for mystery scoops, curated add-ons, hampers, and playful gifting moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-poppins">
        <SmoothScrollController />
        {children}
      </body>
    </html>
  );
}
