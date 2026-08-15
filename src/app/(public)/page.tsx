import type { Metadata } from "next";
import AboutSection from "@/components/landing/AboutSection";
import FAQSection, { faqItems } from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import HeroSplit from "@/components/landing/HeroSplit";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LandingAuthCheck from "@/components/landing/LandingAuthCheck";
import PlacementTestSection from "@/components/landing/PlacementTestSection";
import TrustSection from "@/components/landing/TrustSection";
import UserTypeSection from "@/components/landing/UserTypeSection";
import WhyUsSection from "@/components/landing/WhyUsSection";

const title = "آموزش هوشمند زبان انگلیسی و تعیین سطح آنلاین";
const description =
  "با ExamificatioN سطح زبان خود را بسنجید، مسیر یادگیری شخصی‌سازی‌شده بسازید و مهارت‌های مکالمه، شنیداری، خواندن و نوشتن را هدفمند تمرین کنید.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "آموزش زبان انگلیسی",
    "تعیین سطح زبان",
    "یادگیری زبان با هوش مصنوعی",
    "کلاس آنلاین زبان",
    "آموزش زبان برای بزرگسالان",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${title} | ExamificatioN`,
    description,
    url: "/",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ExamificatioN`,
    description,
  },
};

export default function HomePage() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "ExamificatioN",
        description,
        inLanguage: "fa-IR",
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${baseUrl}/#organization`,
        name: "ExamificatioN",
        url: baseUrl,
        logo: `${baseUrl}/brand-logo.png`,
        description,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <LandingAuthCheck>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HeroSplit />
      <UserTypeSection />
      <WhyUsSection />
      <HowItWorksSection />
      <TrustSection />
      <PlacementTestSection />
      <AboutSection />
      <FAQSection />
      <FinalCTASection />
    </LandingAuthCheck>
  );
}
