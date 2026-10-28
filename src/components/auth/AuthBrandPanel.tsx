"use client";

import { HiCheck } from "react-icons/hi";
import BrandMark from "@/components/ui/BrandMark";
import FadeInImage from "@/components/ui/FadeInImage";
// The waiting pose from the character sheet; decorative.
import waitingPose from "../../../public/images/character/08-waiting.png";

const promises = [
  "تعیین سطح و مسیر متناسب با هدف شما",
  "تمرین چهار مهارت در کنار واژگان و گرامر",
  "مشاهده روند پیشرفت در طول مسیر",
] as const;

/**
 * Brand side of the sign-in dialog, shown from md up. It repeats the home
 * page's promise next to the form, so the dialog reads as part of the site
 * rather than a bare form.
 */
export default function AuthBrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden flex-col overflow-hidden bg-linear-to-br from-brand-primary via-brand-primary to-brand-secondary px-7 pt-7 text-white md:flex lg:px-8 lg:pt-8"
    >
      <div
        className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-brand-accent/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -start-20 size-64 rounded-full border-[2.5rem] border-white/5"
        aria-hidden="true"
      />

      <div className="relative">
        <BrandMark inverse prefetch={false} />
        <h3 className="mt-7 text-xl font-black leading-snug lg:text-2xl">
          مسیر شخصی شما برای پیشرفت
        </h3>
        <ul className="mt-5 space-y-3">
          {promises.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/80">
              <HiCheck className="mt-0.5 size-5 shrink-0 text-brand-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* The feet sit on the panel's bottom edge; the ellipse is the shadow. */}
      <div className="relative mt-auto flex justify-center pt-8 after:absolute after:inset-x-[30%] after:bottom-0 after:h-3 after:rounded-[100%] after:bg-black/35 after:blur-md">
        <FadeInImage
          src={waitingPose}
          alt=""
          sizes="(min-width: 1024px) 96px, 82px"
          className="relative h-[260px] w-auto lg:h-[300px]"
        />
      </div>
    </aside>
  );
}
