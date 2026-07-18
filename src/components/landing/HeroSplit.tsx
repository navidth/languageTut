"use client";

import AuthModalButton from "../auth/AuthModalButton";
import { HiSparkles } from "react-icons/hi";

export default function HeroSplit() {
      return (
            <section className="relative w-full h-[90vh] overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
                        <div className="flex items-center justify-center bg-background text-foreground">
                              <div className="text-center px-6">
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

                        <div className="flex items-center justify-center bg-zinc-900 text-white dark:bg-card">
                              <div className="text-center px-6">
                                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                          مدرس هستید؟
                                    </h1>
                                    <p className="text-zinc-300 mb-6">
                                          کلاس ها و شاگردانتان را هوشمند مدیریت کنید
                                    </p>
                                    <AuthModalButton color="light" className="cursor-pointer">
                                          شروع تدریس
                                    </AuthModalButton>
                              </div>
                        </div>
                  </div>

                  <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                        <button
                              className="
                                    flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full
                                    border border-border bg-white text-foreground shadow-2xl transition hover:scale-105
                                    dark:bg-zinc-900
                              "
                        >
                              <HiSparkles className="mb-2 h-8 w-8 text-primary" />
                              <span className="text-sm font-semibold">
                                    شروع هوشمند با AI
                              </span>
                        </button>
                  </div>
            </section>
      );
}
