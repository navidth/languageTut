type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Short facts shown as a row under the actions. */
  highlights?: readonly string[];
  /** The page's main actions, such as a sign-up button and a link. */
  children?: React.ReactNode;
};

// Opening section for the public inner pages. The top padding clears the
// fixed site header.
export default function PageHero({
  eyebrow,
  title,
  description,
  highlights,
  children,
}: PageHeroProps) {
  return (
    <section
      aria-labelledby="page-hero-heading"
      className="relative overflow-hidden bg-background px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:pb-28 lg:pt-44"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgb(231_121_23/0.14),transparent_32%),radial-gradient(circle_at_85%_60%,rgb(85_38_79/0.14),transparent_36%)] mask-b-from-60%"
        aria-hidden="true"
      />
      <div className="landing-dot-grid pointer-events-none absolute inset-x-0 top-0 h-80 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="section-eyebrow">{eyebrow}</span>
        <h1
          id="page-hero-heading"
          className="mt-6 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.15]"
        >
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
          {description}
        </p>

        {children && (
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {children}
          </div>
        )}

        {highlights && highlights.length > 0 && (
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-2.5" aria-label="ویژگی‌های کلیدی">
            {highlights.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-semibold text-foreground/80 backdrop-blur-sm"
              >
                <span className="size-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
