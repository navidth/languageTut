export default function WhyUsSection() {
  const items = [
    "یادگیری شخصی‌سازی شده با AI",
    "مناسب زبان‌آموز و مدرس",
    "تحلیل پیشرفت هوشمند",
    "طراحی مدرن و سریع",
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          چرا ما؟
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
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
