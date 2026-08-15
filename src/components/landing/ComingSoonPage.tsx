import Link from "next/link";
import type { IconType } from "react-icons";

type ComingSoonPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconType;
};

export default function ComingSoonPage({
  eyebrow,
  title,
  description,
  icon: Icon,
}: ComingSoonPageProps) {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-4 py-28 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(231_121_23_/_0.16),transparent_34%),radial-gradient(circle_at_80%_70%,rgb(85_38_79_/_0.14),transparent_34%)]" />
      <div className="surface-card relative w-full max-w-2xl rounded-3xl p-8 text-center sm:p-12">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-accent-soft text-4xl text-brand-secondary dark:text-brand-accent">
          <Icon aria-hidden="true" />
        </span>
        <p className="mt-7 text-sm font-bold text-brand-secondary dark:text-brand-accent">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">
          به‌زودی
        </h1>
        <h2 className="mt-5 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl leading-8 text-muted-foreground">
          {description}
        </p>
        <Link href="/" className="brand-button mt-8 inline-flex rounded-xl px-6 py-3">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </section>
  );
}
