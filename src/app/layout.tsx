import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import StoreProvider from "./StoreProvider";
import AuthGuard from "./AuthGuard";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Quotation System",
  description: "Admin Quotation System"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="preload" href="https://lineview.com/wp-content/uploads/2024/06/robot-arms-in-the-factory-performs-precise-work-ac-2022-11-01-02-00-17-utc-scaled.jpg" as="image" />
        <link rel="preload" href="/logo.png" as="image" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StoreProvider>
          <AuthGuard>
            <AntdRegistry>{children}</AntdRegistry>
          </AuthGuard>
        </StoreProvider>
      </body>
    </html>
  );
}
