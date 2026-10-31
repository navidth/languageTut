"use client";

import { useState, type ReactNode } from "react";
import {
  HiArrowLeft,
  HiCalendar,
  HiChartBar,
  HiChatAlt,
  HiClipboardList,
  HiCollection,
  HiLockClosed,
  HiViewGrid,
} from "react-icons/hi";
import CodeInput from "@/components/ui/CodeInput";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Countdown from "@/components/ui/Countdown";
import { useCountdown } from "@/hooks/useCountdown";
import EmptyState from "@/components/ui/EmptyState";
import FileDropzone from "@/components/ui/FileDropzone";
import ProgressRing from "@/components/ui/ProgressRing";
import PulseLoader, { LoadingContent } from "@/components/ui/PulseLoader";
import SegmentedControl from "@/components/ui/SegmentedControl";

const ranges = [
  { value: "week", label: "هفته", icon: HiCalendar },
  { value: "month", label: "ماه", icon: HiChartBar },
  { value: "all", label: "همه", icon: HiViewGrid },
] as const;

const loginMethods = [
  { value: "password", label: "با رمز عبور", icon: HiLockClosed },
  { value: "code", label: "با کد پیامکی", icon: HiChatAlt },
] as const;

export default function UiKitGallery() {
  return (
    <div className="bg-background px-4 pb-28 pt-32 sm:px-6 sm:pt-36">
      <div className="mx-auto max-w-5xl">
        <span className="section-eyebrow">فقط در محیط توسعه</span>
        <h1 className="mt-4 text-3xl font-black text-foreground sm:text-4xl">کیت رابط کاربری</h1>
        <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">
          کامپوننت‌های مشترکی که Flowbite ندارد. هر کدام با کیبورد، صفحه‌خوان، حالت تیره و چیدمان راست‌به‌چپ کار می‌کند.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <SegmentedDemo />
          <CodeInputDemo />
          <CountdownDemo />
          <ProgressRingDemo />
          <FileDropzoneDemo />
          <ConfirmDialogDemo />
          <PulseLoaderDemo />
          <EmptyStateDemo />
        </div>
      </div>
    </div>
  );
}

function Demo({ title, file, note, children, wide = false }: { title: string; file: string; note: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`surface-card rounded-3xl p-6 hover:shadow-(--shadow-brand-sm) ${wide ? "lg:col-span-2" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        <code lang="en" dir="ltr" className="latin-code rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {file}
        </code>
      </div>
      <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{note}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SegmentedDemo() {
  const [range, setRange] = useState<(typeof ranges)[number]["value"]>("week");
  const [method, setMethod] = useState<(typeof loginMethods)[number]["value"]>("password");
  return (
    <Demo title="SegmentedControl" file="ui/SegmentedControl.tsx" note="انتخاب یکی از چند گزینه؛ با کلیدهای جهت (برعکس در راست‌به‌چپ)، Home و End.">
      <div className="space-y-4">
        <SegmentedControl label="بازه زمانی" options={ranges} value={range} onChange={setRange} />
        <SegmentedControl label="روش ورود" options={loginMethods} value={method} onChange={setMethod} />
      </div>
    </Demo>
  );
}

function CodeInputDemo() {
  const [code, setCode] = useState("");
  return (
    <Demo title="CodeInput" file="ui/CodeInput.tsx" note="کد پیامک یا ایمیل؛ ارقام فارسی، فاصله و خط تیره هنگام تایپ یا چسباندن پاک می‌شوند.">
      <label htmlFor="kit-code" className="mb-2 block text-sm font-bold text-foreground">
        کد تأیید
      </label>
      <CodeInput
        id="kit-code"
        value={code}
        onValueChange={setCode}
        placeholder="۱۲۳۴۵۶"
        className="w-full rounded-xl border border-input bg-card p-3 text-center text-lg font-bold tracking-[0.4em] text-foreground focus:border-brand-accent focus:ring-4 focus:ring-accent-soft focus-visible:outline-none"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        مقدار ارسالی: <span lang="en" dir="ltr" className="latin-code font-bold text-foreground">{code || "—"}</span>
      </p>
    </Demo>
  );
}

function CountdownDemo() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const remaining = useCountdown(deadline);
  const seconds = remaining === null ? null : Math.ceil(remaining / 1000);
  return (
    <Demo title="Countdown و useCountdown" file="ui/Countdown.tsx" note="زمان باقی‌مانده با ارقام فارسی؛ در یک دقیقه آخر قرمز می‌شود و می‌تپد.">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-secondary-soft/40 p-4 text-center">
          <p className="text-xs text-muted-foreground">روی سطح روشن</p>
          <Countdown seconds={seconds} fallback="۲۰ دقیقه" className="mt-1 text-2xl font-black text-foreground" />
        </div>
        <div className="rounded-2xl bg-linear-to-br from-brand-primary to-brand-secondary p-4 text-center text-white">
          <p className="text-xs text-white/70">روی سربرگ تیره</p>
          <Countdown seconds={seconds} fallback="۲۰ دقیقه" className="dark mt-1 text-2xl font-black text-brand-accent" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setDeadline(Date.now() + 75_000)} className="ghost-button cursor-pointer rounded-xl px-4 py-2 text-sm">
          شروع از ۱:۱۵
        </button>
        <button type="button" onClick={() => setDeadline(Date.now() + 20_000)} className="ghost-button cursor-pointer rounded-xl px-4 py-2 text-sm">
          ۲۰ ثانیه
        </button>
        <button type="button" onClick={() => setDeadline(null)} className="ghost-button cursor-pointer rounded-xl px-4 py-2 text-sm">
          توقف
        </button>
      </div>
    </Demo>
  );
}

function ProgressRingDemo() {
  const samples = [
    { value: null, tone: "accent", text: "—", caption: "نامشخص" },
    { value: 35, tone: "warning", text: "۳۵٪", caption: "نیاز به تمرین" },
    { value: 72, tone: "accent", text: "۷۲٪", caption: "درصد" },
    { value: 100, tone: "success", text: "۱۰۰٪", caption: "قبول" },
  ] as const;
  return (
    <Demo title="ProgressRing" file="ui/ProgressRing.tsx" note="نمایش دایره‌ای امتیاز یا پیشرفت؛ Progress در Flowbite فقط نواری است.">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {samples.map(({ value, tone, text, caption }) => (
          <ProgressRing
            key={caption}
            value={value}
            tone={tone}
            label={value === null ? "درصد نامشخص" : `درصد: ${text}`}
            caption={caption}
            className="mx-auto size-28"
          >
            {text}
          </ProgressRing>
        ))}
      </div>
    </Demo>
  );
}

function FileDropzoneDemo() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <Demo title="FileDropzone" file="ui/FileDropzone.tsx" note="انتخاب فایل با کلیک، کیبورد یا کشیدن و رها کردن؛ FileInput در Flowbite کشیدن و رها کردن ندارد.">
      <p id="kit-file-label" className="mb-2 text-sm font-bold text-foreground">
        فایل پاسخ
      </p>
      <FileDropzone id="kit-file" file={file} onFileChange={setFile} aria-labelledby="kit-file-label" hint="PDF، Word یا تصویر، حداکثر ۱۰ مگابایت" />
    </Demo>
  );
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState<"danger" | "primary" | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  function confirm() {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setResult(open === "danger" ? "حذف شد." : "ثبت شد.");
      setOpen(null);
    }, 1200);
  }

  return (
    <Demo title="ConfirmDialog" file="ui/ConfirmDialog.tsx" note="جایگزین window.confirm؛ روی Modal خود Flowbite ساخته شده، فوکوس اول روی «انصراف» است و هنگام اجرا قفل می‌شود.">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen("danger")} className="danger-button cursor-pointer rounded-xl px-4 py-2 text-sm">
          حذف تکلیف
        </button>
        <button type="button" onClick={() => setOpen("primary")} className="brand-button cursor-pointer rounded-xl px-4 py-2 text-sm">
          ثبت نهایی آزمون
        </button>
      </div>
      {result && (
        <p className="feedback-success mt-4 rounded-xl p-3 text-sm" role="status">
          {result}
        </p>
      )}
      <ConfirmDialog
        open={open !== null}
        tone={open ?? "primary"}
        title={open === "danger" ? "حذف تکلیف" : "ثبت نهایی آزمون"}
        description={
          open === "danger"
            ? "پاسخ ارسال‌شده حذف می‌شود و این کار برگشت‌پذیر نیست."
            : "بعد از ثبت نهایی، دیگر نمی‌توانید پاسخ‌ها را تغییر دهید."
        }
        confirmLabel={open === "danger" ? "بله، حذف شود" : "ثبت نهایی"}
        loadingLabel={open === "danger" ? "در حال حذف..." : "در حال ثبت..."}
        loading={loading}
        onConfirm={confirm}
        onCancel={() => setOpen(null)}
      />
    </Demo>
  );
}

function PulseLoaderDemo() {
  const [loading, setLoading] = useState(false);

  function run() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2500);
  }

  return (
    <Demo title="PulseLoader و LoadingContent" file="ui/PulseLoader.tsx" note="لودینگ سه‌نقطه به‌جای «در حال بررسی...»؛ دکمه هنگام انتظار هم‌اندازه می‌ماند و صفحه‌خوان متن انتظار را می‌خواند.">
      <div className="flex flex-wrap items-center gap-6 text-brand-secondary dark:text-brand-accent">
        <PulseLoader size="sm" label="کوچک" />
        <PulseLoader size="md" label="متوسط" />
        <PulseLoader size="lg" label="بزرگ" />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} disabled={loading} aria-busy={loading} className="brand-button cursor-pointer rounded-full px-6 py-2.5 text-sm">
          <LoadingContent loading={loading} label="در حال بررسی">
            شروع یادگیری
          </LoadingContent>
        </button>
        <button type="button" onClick={run} disabled={loading} aria-busy={loading} className="brand-button flex min-h-12 w-56 cursor-pointer items-center justify-center rounded-2xl px-5 text-sm">
          <LoadingContent loading={loading} label="در حال بررسی">
            ورود و ادامه
            <HiArrowLeft className="size-5" aria-hidden="true" />
          </LoadingContent>
        </button>
      </div>
    </Demo>
  );
}

function EmptyStateDemo() {
  return (
    <Demo wide title="EmptyState" file="ui/EmptyState.tsx" note="پنل «هنوز چیزی اینجا نیست» برای فهرست‌های خالی، با آیکن، توضیح و دکمه.">
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState
          icon={HiCollection}
          headingLevel="h3"
          title="هنوز درسی منتشر نشده است"
          description="درس‌های این دوره به‌زودی اضافه می‌شوند."
        />
        <EmptyState
          variant="card"
          icon={HiClipboardList}
          headingLevel="h3"
          title="تکلیفی برای شما ثبت نشده است"
          description="وقتی مدرس تکلیف جدیدی بگذارد، اینجا نمایش داده می‌شود."
          action={
            <button type="button" className="ghost-button cursor-pointer rounded-xl px-5 py-2.5 text-sm">
              مشاهده دوره‌ها
            </button>
          }
        />
      </div>
    </Demo>
  );
}
