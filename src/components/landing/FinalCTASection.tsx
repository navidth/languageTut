import { Button } from "flowbite-react";

export default function FinalCTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground text-center">
      <h2 className="text-3xl font-bold mb-6">
        آماده‌ای شروع کنی؟
      </h2>
      <div className="flex justify-center gap-4">
        <Button pill color="light">زبان‌آموز هستم</Button>
        <Button pill outline color="light">مدرس هستم</Button>
      </div>
    </section>
  );
}
