"use client";

import { Button } from "flowbite-react";
import { HiSparkles } from "react-icons/hi";

export default function HeroSplit() {
      return (
            <section className="relative w-full h-[90vh] overflow-hidden">
                  {/* Split Background */}
                  <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
                        {/* Left */}
                        <div className="flex items-center justify-center bg-background text-foreground">
                              <div className="text-center px-6">
                                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                          زبان‌آموز هستید؟
                                    </h1>
                                    <p className="text-muted-foreground mb-6">
                                          با کمک هوش مصنوعی، سریع‌تر و هوشمندتر یاد بگیرید
                                    </p>
                                    <Button pill className="cursor-pointer">
                                          شروع یادگیری
                                    </Button>
                              </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center justify-center bg-zinc-900 text-white dark:bg-card">
                              <div className="text-center px-6">
                                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                          مدرس هستید؟
                                    </h1>
                                    <p className="text-zinc-300 mb-6">
                                          کلاس‌ها و شاگردانتان را هوشمند مدیریت کنید
                                    </p>
                                    <Button color="light" pill className="cursor-pointer">
                                          شروع تدریس
                                    </Button>
                              </div>
                        </div>

                  </div>

                  {/* Center AI Button */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button className="text-foreground
                        cursor-pointer
          w-32 h-32 rounded-full
          bg-white dark:bg-zinc-900
          shadow-2xl
          flex flex-col items-center justify-center
          border border-border
          hover:scale-105 transition
        ">
                              <HiSparkles className="w-8 h-8 text-primary mb-2" />
                              <span className="font-semibold text-sm">
                                    شروع هوشمند با AI
                              </span>
                        </button>
                  </div>
            </section>
      );
}
