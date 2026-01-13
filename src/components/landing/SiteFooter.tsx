"use client";
import Link from "next/link";
import {
      Footer,
      FooterBrand,
      FooterCopyright,
      FooterDivider,
      FooterIcon,
      FooterLink,
      FooterLinkGroup,
      FooterTitle,
} from "flowbite-react";
import {
      FaInstagram,
      FaLinkedin,
      FaTelegramPlane,
      FaGithub,
} from "react-icons/fa";

export default function SiteFooter() {
      return (
            <Footer container className=" rounded-none bg-secondary border-t border-border">
                  <div className="w-full max-w-6xl mx-auto px-6 py-14">
                        {/* Top */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                              {/* Brand */}
                              <div className="md:col-span-4">
                                    <FooterBrand
                                          src="/images/vercel.svg"
                                          href="/"
                                          title="نام برند"
                                          name="نام برند"
                                    />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                          یادگیری و تدریس با کمک هوش مصنوعی
                                    </p>

                                    <p className="mt-5 text-sm leading-7 text-muted-foreground">
                                          یک پلتفرم دوطرفه برای زبان‌آموزها و مدرس‌ها؛ با ابزارهای هوشمند،
                                          مسیر یادگیری و مدیریت کلاس‌ها سریع‌تر و دقیق‌تر می‌شود.
                                    </p>

                                    {/* Social */}
                                    <div className="mt-6 flex gap-4">
                                          <FooterIcon href="#" icon={FaInstagram} />
                                          <FooterIcon href="#" icon={FaLinkedin} />
                                          <FooterIcon href="#" icon={FaTelegramPlane} />
                                          <FooterIcon href="#" icon={FaGithub} />
                                    </div>
                              </div>

                              {/* Quick Links */}
                              <div className="md:col-span-2">
                                    <FooterTitle title="لینک‌های سریع" />
                                    <FooterLinkGroup col>
                                          <FooterLink as={Link} href="#about">درباره ما</FooterLink>
                                          <FooterLink as={Link} href="#why-us">چرا ما؟</FooterLink>
                                          <FooterLink as={Link} href="#pricing">تعرفه‌ها</FooterLink>
                                          <FooterLink as={Link} href="#faq">سوالات متداول</FooterLink>
                                    </FooterLinkGroup>
                              </div>

                              {/* Product */}
                              <div className="md:col-span-3">
                                    <FooterTitle title="محصول" />
                                    <FooterLinkGroup col>
                                          <FooterLink as={Link} href="/student">برای زبان‌آموزها</FooterLink>
                                          <FooterLink as={Link} href="/teacher">برای مدرس‌ها</FooterLink>
                                          <FooterLink as={Link} href="/ai">دستیار AI</FooterLink>
                                          <FooterLink as={Link} href="/blog">بلاگ</FooterLink>
                                    </FooterLinkGroup>
                              </div>

                              {/* Newsletter (custom – Flowbite فرم آماده ندارد) */}
                              <div className="md:col-span-3">
                                    <FooterTitle title="خبرنامه" />
                                    <p className="text-sm text-muted-foreground mb-4 leading-7">
                                          ایمیلت رو وارد کن تا آپدیت‌های محصول و نکات آموزشی رو دریافت کنی.
                                    </p>

                                    <form
                                          onSubmit={(e) => e.preventDefault()}
                                          className="flex gap-2"
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

                                    <p className="mt-4 text-xs text-muted-foreground">
                                          با عضویت، شرایط و قوانین را می‌پذیرید.
                                    </p>
                              </div>
                        </div>

                        <FooterDivider />

                        {/* Bottom */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                              <FooterCopyright
                                    href="#"
                                    by="نام برند"
                                    year={new Date().getFullYear()}
                              />

                              <FooterLinkGroup>
                                    <FooterLink as={Link} href="/privacy">حریم خصوصی</FooterLink>
                                    <FooterLink as={Link} href="/terms">قوانین و مقررات</FooterLink>
                                    <FooterLink as={Link} href="/contact">تماس با ما</FooterLink>
                              </FooterLinkGroup>
                        </div>
                  </div>
            </Footer>
      );
}
