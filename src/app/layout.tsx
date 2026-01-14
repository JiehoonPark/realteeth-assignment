import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/shared/providers/react-query-provider";
import { AppGnb } from "@/widgets/gnb/ui/app-gnb.client";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Realteeth Weather",
  description: "날씨 정보를 제공하는 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <div className="min-h-screen bg-background text-foreground">
            <AppGnb />
            <div className="pt-20">{children}</div>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
