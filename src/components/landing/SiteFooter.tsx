"use client";

import Link from "next/link";
import { Footer } from "flowbite-react";
import { FaInstagram, FaLinkedin, FaTelegramPlane, FaGithub } from "react-icons/fa";

export default function SiteFooter() {
      return (
            <footer className="bg-card border-t border-border">
                  <div className="max-w-6xl mx-auto px-6 py-14">
                        {/* Top */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                              {/* Brand */}
                              <div className="md:col-span-4">
                                    <div className="flex items-center gap-3">
                                          {/* اگر Brand component داری می‌تونی جایگزین کنی */}
                                          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-border flex items-center justify-center">
                                                <span className="text-primary font-bold">AI</span>
                                          </div>

                                          <div>
                                                <p className="font-bold text-lg text-foreground">نام برند</p>
                                                <p className="text-sm text-muted-foreground">یادگیری و تدریس با کمک هوش مصنوعی</p>
                                          </div>
                                    </div>

                                    <p className="mt-5 text-sm leading-7 text-muted-foreground">
                                          یک پلتفرم دوطرفه برای زبان‌آموزها و مدرس‌ها؛ با ابزارهای هوشمند، مسیر یادگیری
                                          و مدیریت کلاس‌ها سریع‌تر و دقیق‌تر می‌شود.
                                    </p>

                                    {/* Social */}
                                    <div className="mt-6 flex items-center gap-3">
                                          <SocialIcon href="#" label="Instagram">
                                                <FaInstagram />
                                          </SocialIcon>
                                          <SocialIcon href="#" label="LinkedIn">
                                                <FaLinkedin />
                                          </SocialIcon>
                                          <SocialIcon href="#" label="Telegram">
                                                <FaTelegramPlane />
                                          </SocialIcon>
                                          <SocialIcon href="#" label="GitHub">
                                                <FaGithub />
                                          </SocialIcon>
                                    </div>
                              </div>

                              {/* Links */}
                              <div className="md:col-span-2">
                                    <p className="font-semibold text-foreground mb-4">لینک‌های سریع</p>
                                    <ul className="space-y-3 text-sm">
                                          <FooterLink href="#about" text="درباره ما" />
                                          <FooterLink href="#why-us" text="چرا ما؟" />
                                          <FooterLink href="#pricing" text="تعرفه‌ها" />
                                          <FooterLink href="#faq" text="سوالات متداول" />
                                    </ul>
                              </div>

                              {/* Product */}
                              <div className="md:col-span-3">
                                    <p className="font-semibold text-foreground mb-4">محصول</p>
                                    <ul className="space-y-3 text-sm">
                                          <FooterLink href="/student" text="برای زبان‌آموزها" />
                                          <FooterLink href="/teacher" text="برای مدرس‌ها" />
                                          <FooterLink href="/ai" text="دستیار AI" />
                                          <FooterLink href="/blog" text="بلاگ" />
                                    </ul>
                              </div>

                              {/* Newsletter */}
                              <div className="md:col-span-3">
                                    <p className="font-semibold text-foreground mb-4">خبرنامه</p>
                                    <p className="text-sm text-muted-foreground mb-4 leading-7">
                                          ایمیلت رو وارد کن تا آپدیت‌های محصول و نکات آموزشی رو دریافت کنی.
                                    </p>

                                    <form
                                          onSubmit={(e) => e.preventDefault()}
                                          className="flex items-center gap-2"
                                    >
                                          <input
                                                type="email"
                                                placeholder="example@email.com"
                                                className="
                  w-full rounded-xl border border-border bg-background px-4 py-3
                  text-sm text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                "
                                          />
                                          <button
                                                type="submit"
                                                className="
                  rounded-xl px-4 py-3 text-sm font-semibold
                  bg-primary text-primary-foreground
                  hover:opacity-90 transition
                "
                                          >
                                                عضویت
                                          </button>
                                    </form>

                                    <div className="mt-4 text-xs text-muted-foreground">
                                          با عضویت، شرایط و قوانین را می‌پذیرید.
                                    </div>
                              </div>
                        </div>

                        {/* Divider */}
                        <div className="my-10 h-px bg-border" />

                        {/* Bottom */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                              <p className="text-sm text-muted-foreground">
                                    © {new Date().getFullYear()} نام برند — تمام حقوق محفوظ است.
                              </p>

                              <div className="flex items-center gap-6 text-sm">
                                    <Link
                                          href="/privacy"
                                          className="text-muted-foreground hover:text-foreground transition"
                                    >
                                          حریم خصوصی
                                    </Link>
                                    <Link
                                          href="/terms"
                                          className="text-muted-foreground hover:text-foreground transition"
                                    >
                                          قوانین و مقررات
                                    </Link>
                                    <Link
                                          href="/contact"
                                          className="text-muted-foreground hover:text-foreground transition"
                                    >
                                          تماس با ما
                                    </Link>
                              </div>
                        </div>
                  </div>
            </footer>
      );
}

function FooterLink({ href, text }: { href: string; text: string }) {
      return (
            <li>
                  <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground transition"
                  >
                        {text}
                  </Link>
            </li>
      );
}

function SocialIcon({
      href,
      label,
      children,
}: {
      href: string;
      label: string;
      children: React.ReactNode;
}) {
      return (
            <Link
                  href={href}
                  aria-label={label}
                  className="
        w-10 h-10 rounded-xl border border-border bg-background
        flex items-center justify-center
        text-foreground/80 hover:text-foreground hover:shadow-md transition
      "
            >
                  {children}
            </Link>
      );
}
