import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mediflow - Healthcare Management Platform",
  description: "Connect with doctors for online consultations, manage medical records, and schedule appointments securely.",
  keywords: ["healthcare", "telemedicine", "doctor consultation", "medical records", "appointments"],
  authors: [{ name: "Mediflow Team" }],
  openGraph: {
    title: "Mediflow - Healthcare Management Platform",
    description: "Connect with doctors for online consultations and manage your healthcare needs",
    url: "https://mediflow.com",
    siteName: "Mediflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mediflow - Healthcare Management Platform",
    description: "Connect with doctors for online consultations and manage your healthcare needs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProviderWrapper>
          {children}
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
