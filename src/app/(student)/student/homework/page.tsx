import { Suspense } from "react";
import type { Metadata } from "next";
import HomeworkListRoute from "@/components/dashboard/homework/HomeworkListRoute";
import { SkeletonGrid } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "تکالیف" };

export default function Page() {
  return (
    // The list reads its filters from the URL query on the client, so the
    // page itself stays a static shell.
    <Suspense
      fallback={
        <section className="mx-auto max-w-6xl">
          <SkeletonGrid label="در حال دریافت تکالیف..." />
        </section>
      }
    >
      <HomeworkListRoute />
    </Suspense>
  );
}
