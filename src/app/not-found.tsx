import Link from "next/link";
import { HiOutlineSearch } from "react-icons/hi";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-background px-4 py-20 text-foreground">
      <div className="max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-soft text-brand-secondary">
          <HiOutlineSearch className="size-8" aria-hidden="true" />
        </span>
        <p lang="en" dir="ltr" className="mt-6 text-sm font-black tracking-[0.25em] text-brand-accent">ERROR 404</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">صفحه موردنظر پیدا نشد</h1>
        <p className="mt-4 leading-8 text-muted-foreground">
          ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد.
        </p>
        <Link href="/" className="brand-button mt-8 inline-flex rounded-xl px-6 py-3">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
