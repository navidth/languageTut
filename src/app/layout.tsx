import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeModeScript } from 'flowbite-react';
import localFont from "next/font/local";
import StoreProvider from "@/store/StoreProvider";
const iranSans = localFont({
  src: "../../public/fonts/IRANSans(FaNum).ttf",
  variable: "--font-iran-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "آموزش آنلاین آیلتس", template: "%s | آموزش آیلتس" },
  description: "دوره‌های آنلاین آیلتس از سطح A1 تا C2 همراه با درس‌های مهارت‌محور.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="fa" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${iranSans.variable}  antialiased flex flex-col `}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
