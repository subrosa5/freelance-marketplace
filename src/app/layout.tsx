import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "FreelanceHub — Marketplace for Freelancers",
  description: "Hire top freelancers or offer your services. Secure payments, real-time chat.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#080808] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
