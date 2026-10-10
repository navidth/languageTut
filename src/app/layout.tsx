import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeModeScript } from "flowbite-react";
import localFont from "next/font/local";
import StoreProvider from "@/store/StoreProvider";
import AuthFlowProvider from "@/components/auth/AuthFlowProvider";

// WOFF2 copy of IRANSans(FaNum).ttf with every glyph kept, at less than half
// the size.
const iranSans = localFont({
  src: "../../public/fonts/IRANSans-FaNum.woff2",
  variable: "--font-iran-sans",
  display: "swap",
});

// Latin-only subset of AbyssinicaSIL-Regular.ttf; it only renders short
// `lang="en"` labels, so it loads on demand instead of on every page.
const abyssinicaSil = localFont({
  src: "../../public/fonts/AbyssinicaSIL-Latin.woff2",
  variable: "--font-abyssinica-sil",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: "ExamificatioN",
  title: {
    default: "ExamificatioN | پلتفرم هوشمند آموزش زبان",
    template: "%s | ExamificatioN",
  },
  description:
    "ExamificatioN، پلتفرم هوشمند آموزش زبان برای یادگیری شخصی‌سازی‌شده، دوره‌های مهارت‌محور و مدیریت کلاس.",
  keywords: ["ExamificatioN", "آموزش زبان", "آیلتس", "یادگیری هوشمند"],
  creator: "ExamificatioN",
  icons: {
    icon: "/brand-icon.png",
    shortcut: "/brand-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ExamificatioN",
    title: "ExamificatioN | پلتفرم هوشمند آموزش زبان",
    description: "یادگیری و تدریس زبان با تجربه‌ای هوشمند و شخصی‌سازی‌شده.",
  },
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
      <body className={`${iranSans.variable} ${abyssinicaSil.variable} ${iranSans.className} flex min-h-screen flex-col antialiased`}>
        <StoreProvider>
          <AuthFlowProvider>{children}</AuthFlowProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
