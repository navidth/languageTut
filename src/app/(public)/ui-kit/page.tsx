import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UiKitGallery from "./UiKitGallery";

export const metadata: Metadata = {
  title: "کیت رابط کاربری",
  robots: { index: false, follow: false },
};

/**
 * A gallery of the shared components that Flowbite does not provide, for
 * reviewing them in both themes and at every width. Development only.
 */
export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiKitGallery />;
}
