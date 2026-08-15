import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeModeScript } from "flowbite-react";
import localFont from "next/font/local";
import StoreProvider from "@/store/StoreProvider";
import AuthFlowProvider from "@/components/auth/AuthFlowProvider";

const iranSans = localFont({
  src: "../../public/fonts/IRANSans(FaNum).ttf",
  variable: "--font-iran-sans",
  display: "swap",
});

const abyssinicaSil = localFont({
  src: "../../public/fonts/AbyssinicaSIL-Regular.ttf",
  variable: "--font-abyssinica-sil",
  display: "swap",
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
