"use client";

import { useEffect } from "react";
import Link from "next/link";
import { fetchSkill } from "@/store/skillsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { skillDescriptions, skillLabels } from "./skillPresentation";

export default function SkillDetail({ id }: { id: number }) {
  const dispatch = useAppDispatch();
  const { selected, detailStatus, detailError } = useAppSelector(
    (state) => state.skills,
  );

  useEffect(() => {
    if (Number.isInteger(id) && id > 0) {
      void dispatch(fetchSkill(id));
    }
  }, [dispatch, id]);

  if (!Number.isInteger(id) || id <= 0) {
    return <DetailMessage text="شناسه مهارت معتبر نیست." />;
  }

  if (detailStatus === "idle" || detailStatus === "loading") {
    return (
      <div
        className="mx-auto max-w-3xl animate-pulse rounded-3xl border border-border bg-card p-8"
        role="status"
        aria-label="در حال دریافت جزئیات مهارت"
      >
        <div className="h-8 w-1/3 rounded bg-secondary" />
        <div className="mt-6 h-4 w-full rounded bg-secondary" />
        <div className="mt-3 h-4 w-2/3 rounded bg-secondary" />
      </div>
    );
  }

  if (detailStatus === "failed" || !selected) {
    return (
      <DetailMessage
        text={detailError ?? "مهارت موردنظر دریافت نشد."}
        retry={() => void dispatch(fetchSkill(id))}
      />
    );
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/student/skills"
        className="brand-link mb-6 inline-flex"
      >
        → بازگشت به مهارت‌ها
      </Link>
      <article className="surface-card overflow-hidden rounded-3xl">
        <div className="page-hero p-8">
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm">
            شناسه {selected.id.toLocaleString("fa-IR")}
          </span>
          <h1 className="mt-5 text-3xl font-black">
            {skillLabels[selected.name]}
          </h1>
          <p lang="en" dir="ltr" className="page-hero-muted mt-2 text-left">{selected.name}</p>
        </div>
        <div className="p-8">
          <p className="text-lg leading-9 text-muted-foreground">
            {skillDescriptions[selected.name]}
          </p>
          <dl className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary-soft p-4">
              <dt className="text-sm text-muted-foreground">نام API</dt>
              <dd className="mt-2 font-bold" dir="ltr">
                {selected.name}
              </dd>
            </div>
            <div className="rounded-2xl bg-secondary-soft p-4">
              <dt className="text-sm text-muted-foreground">ترتیب نمایش</dt>
              <dd className="mt-2 font-bold">
                {selected.order.toLocaleString("fa-IR")}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </section>
  );
}

function DetailMessage({
  text,
  retry,
}: {
  text: string;
  retry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center">
      <p className="text-muted-foreground">{text}</p>
      <div className="mt-5 flex justify-center gap-3">
        {retry && (
          <button
            type="button"
            onClick={retry}
            className="brand-button rounded-xl px-5 py-2"
          >
            تلاش دوباره
          </button>
        )}
        <Link
          href="/student/skills"
          className="ghost-button rounded-xl px-5 py-2"
        >
          بازگشت
        </Link>
      </div>
    </div>
  );
}
