import type { Metadata } from "next";
import { SmoothScrollController } from "@/components/smooth-scroll-controller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mystery Scoop",
  description: "Pick a scoop, add a lucky twist, and watch your mystery assortment come to life.",
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
