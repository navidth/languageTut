"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled global error", error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "#fafafa", color: "#130912", fontFamily: "Tahoma, Arial, sans-serif" }}>
          <div style={{ width: "100%", maxWidth: "36rem", border: "1px solid #ddcfd9", borderRadius: "2rem", background: "#fff", padding: "3rem 2rem", textAlign: "center", boxShadow: "0 18px 48px rgb(19 9 18 / 0.13)" }}>
            <p style={{ color: "#a52a24", fontWeight: 700 }}>خطای سیستمی</p>
            <h1 style={{ marginTop: "0.75rem", fontSize: "2rem" }}>برنامه موقتاً در دسترس نیست</h1>
            <p style={{ marginTop: "1rem", lineHeight: 2, color: "#665363" }}>
              لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، چند دقیقه دیگر صفحه را باز کنید.
            </p>
            {error.digest && <p dir="ltr" style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#665363" }}>Error ID: {error.digest}</p>}
            <button type="button" onClick={reset} style={{ marginTop: "2rem", cursor: "pointer", border: "1px solid #e77917", borderRadius: "0.75rem", background: "#e77917", padding: "0.8rem 1.5rem", color: "#130912", fontWeight: 700 }}>
              تلاش دوباره
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
