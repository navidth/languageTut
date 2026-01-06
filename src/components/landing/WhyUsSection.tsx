export default function WhyUsSection() {
const items = [
  "یادگیری شخصی‌سازی‌شده با هوش مصنوعی",
  "پنل اختصاصی برای زبان‌آموز و مدرس",
  "تحلیل پیشرفت و عملکرد",
  "طراحی سریع، مدرن و موبایل‌محور",
];
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          چرا ما؟
        </h2>

        <div className="grid md:grid-cols-4 gap-6 text-muted-foreground">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border p-6 text-center bg-card hover:shadow-lg transition"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
