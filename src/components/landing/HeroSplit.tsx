"use client";

import AuthModalButton from "../auth/AuthModalButton";
import { HiSparkles } from "react-icons/hi";
import Link from "next/link";

export default function HeroSplit() {
      return (
            <section className="relative min-h-[720px] w-full overflow-hidden md:min-h-[680px]">
                  <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
                        <div className="flex items-center justify-center bg-background px-6 pb-20 pt-32 text-foreground md:py-20">
                              <div className="max-w-lg text-center">
                                    <span className="brand-badge mb-6 inline-flex rounded-full px-4 py-2 text-sm font-bold">مسیر شخصی شما برای پیشرفت</span>
                                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                          زبان آموز هستید؟
                                    </h1>
                                    <p className="text-muted-foreground mb-6">
                                          با کمک هوش مصنوعی، سریع تر و هوشمندتر یاد بگیرید
                                    </p>
                                    <AuthModalButton className="cursor-pointer">
                                           شروع یادگیری
                                    </AuthModalButton>
                              </div>
                        </div>

                        <div className="flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary px-6 py-20 text-white">
                              <div className="max-w-lg text-center">
                                    <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white">مدیریت حرفه‌ای آموزش</span>
                                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                          مدرس هستید؟
                                    </h1>
                                    <p className="mb-6 text-white/75">
                                          کلاس ها و شاگردانتان را هوشمند مدیریت کنید
                                    </p>
                                    <Link href="/teacher" className="brand-button-inverse inline-flex cursor-pointer rounded-full px-6 py-2.5">
                                          شروع تدریس
                                    </Link>
                              </div>
                        </div>
                  </div>

                  <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                        <Link
                              href="/ai"
                              className="
                                    flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full
                                    border-4 border-background bg-brand-accent text-brand-primary shadow-2xl transition hover:scale-105
                              "
                        >
                              <HiSparkles className="mb-2 h-8 w-8 text-brand-primary" />
                              <span className="text-sm font-semibold">
                                    شروع هوشمند با AI
                              </span>
                        </Link>
                  </div>
            </section>
      );
}
