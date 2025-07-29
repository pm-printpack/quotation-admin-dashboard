"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import StoreProvider from "./StoreProvider";
import AuthGuard from "./AuthGuard";
import Head from "next/head";
import { useEffect, useState } from "react";
import { getBrowserLocale, loadLocaleMessages } from "@/lib/i18n";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: "Admin Quotation System",
  description: "Admin Quotation System"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, setLocale] = useState<string>("en-US");
  const [messages, setMessages] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const loc: string = getBrowserLocale();
    setLocale(loc);
    (async () => {
      setMessages(await loadLocaleMessages(loc));
    })();
  }, [])

  return (
    <html lang="en">
      <Head>
        <link rel="preload" href="https://lineview.com/wp-content/uploads/2024/06/robot-arms-in-the-factory-performs-precise-work-ac-2022-11-01-02-00-17-utc-scaled.jpg" as="image" />
        <link rel="preload" href="/logo.png" as="image" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StoreProvider>
          <AuthGuard>
            <AntdRegistry>
              {
                messages
                ?
                <NextIntlClientProvider locale={locale} messages={messages}>
                  {children}
                </NextIntlClientProvider>
                :
                <div>Loading translations…</div>
              }
            </AntdRegistry>
          </AuthGuard>
        </StoreProvider>
      </body>
    </html>
  );
};
