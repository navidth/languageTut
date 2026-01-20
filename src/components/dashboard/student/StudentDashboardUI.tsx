'use client';

import { Button } from 'flowbite-react';
import { GiUpgrade } from 'react-icons/gi';
import { HiOutlineChatAlt2, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineUser } from 'react-icons/hi';
import { LanguageLevelGauge } from './LanguageLevelGauge';
import InformationTotal from './InformationTotal';

export default function StudentDashboardUI() {
      return (
            <div className="min-h-screen text-foreground">
                  {/* Container */}
                  <div className="mx-auto w-full max-w-6xl py-2">
                        {/* Header */}
                        <div className='mt-2 grid grid-cols-1 gap-4 md:grid-cols-3'>
                              <Card
                                    icon={<GiUpgrade className="h-6 w-6 text-primary" />}
                                    title="سطح شما"
                              >
                                    <LanguageLevelGauge level="A2" />
                              </Card>
                              <Card>
                                    <InformationTotal />
                              </Card>
                              <Card
                                    icon={<HiOutlineCalendar className="h-6 w-6 text-primary" />}
                                    title="کلاس بعدی"
                                    action={<Dots />}
                              >
                                    <div className="rounded-2xl border border-border bg-background p-4 text-center">
                                          <div className="text-sm text-muted-foreground">سه‌شنبه</div>
                                          <div className="mt-2 text-2xl font-semibold">18:00</div>
                                          <div className="mt-2 text-sm text-muted-foreground">با استاد رضایی</div>
                                    </div>

                                    <div className="mt-4">
                                          <Button color="blue" className="w-full rounded-2xl">
                                                جزئیات کلاس
                                          </Button>
                                    </div>
                              </Card>
                        </div>
                        {/* Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Assignments */}
                              <Card
                                    icon={<HiOutlineDocumentText className="h-6 w-6 text-primary" />}
                                    title="کلاس بعدی"
                                    action={<Dots />}
                              >
                                    <ul className="space-y-3">
                                          <li className="flex items-center justify-between rounded-2xl border border-border bg-background p-3">
                                                <div className="flex items-center gap-3">
                                                      <span className="h-2.5 w-2.5 rounded-full bg-[oklch(var(--chart-1))]" />
                                                      <div>
                                                            <div className="font-medium">Writing Task 3</div>
                                                            <div className="text-xs text-muted-foreground">مهلت: فردا</div>
                                                      </div>
                                                </div>
                                                <span className="text-xs rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                                                      فوری
                                                </span>
                                          </li>

                                          <li className="flex items-center justify-between rounded-2xl border border-border bg-background p-3">
                                                <div className="flex items-center gap-3">
                                                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                                                      <div>
                                                            <div className="font-medium">Speaking Practice</div>
                                                            <div className="text-xs text-muted-foreground">مهلت: ۳ روز دیگر</div>
                                                      </div>
                                                </div>
                                                <span className="text-xs rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                                                      در حال انجام
                                                </span>
                                          </li>
                                    </ul>

                                    <div className="mt-4">
                                          <Button color="blue" className="w-full rounded-2xl">
                                                ارسال / مشاهده تکالیف
                                          </Button>
                                    </div>
                              </Card>

                              {/* Next Class */}
                              <Card
                                    icon={<HiOutlineCalendar className="h-6 w-6 text-primary" />}
                                    title="کلاس بعدی"
                                    action={<Dots />}
                              >
                                    <div className="rounded-2xl border border-border bg-background p-4 text-center">
                                          <div className="text-sm text-muted-foreground">سه‌شنبه</div>
                                          <div className="mt-2 text-2xl font-semibold">18:00</div>
                                          <div className="mt-2 text-sm text-muted-foreground">با استاد رضایی</div>
                                    </div>

                                    <div className="mt-4">
                                          <Button color="blue" className="w-full rounded-2xl">
                                                جزئیات کلاس
                                          </Button>
                                    </div>
                              </Card>

                              {/* Teacher */}
                              <Card
                                    icon={<HiOutlineUser className="h-6 w-6 text-primary" />}
                                    title="استاد شما"
                                    action={<Dots />}
                              >
                                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
                                          <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                                                <HiOutlineUser className="h-7 w-7 text-secondary-foreground" />
                                          </div>
                                          <div className="flex-1">
                                                <div className="font-semibold">خانم رضایی</div>
                                                <div className="text-xs text-muted-foreground">IELTS • Speaking/Writing</div>
                                          </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                          <Button color="blue" className="rounded-2xl">
                                                پیام
                                          </Button>
                                          <Button color="light" className="rounded-2xl border border-border bg-card text-foreground hover:bg-secondary">
                                                تغییر استاد
                                          </Button>
                                    </div>
                              </Card>

                              {/* Messages / Notifications */}
                              <Card
                                    icon={<HiOutlineChatAlt2 className="h-6 w-6 text-primary" />}
                                    title="پیام‌های جدید"
                                    action={<Dots />}
                              >
                                    <div className="space-y-3">
                                          <div className="rounded-2xl border border-border bg-background p-4">
                                                <div className="text-sm font-medium">استاد رضایی</div>
                                                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                      لطفاً تکلیف Writing Task 3 را با ساختار بهتر بازنویسی کن و دوباره ارسال کن.
                                                </div>
                                          </div>

                                          <div className="rounded-2xl border border-border bg-background p-4">
                                                <div className="text-sm font-medium">سیستم</div>
                                                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                      تکلیف جدید برای Unit 5 اضافه شد.
                                                </div>
                                          </div>
                                    </div>

                                    <div className="mt-4">
                                          <Button color="blue" className="w-full rounded-2xl">
                                                مشاهده همه پیام‌ها
                                          </Button>
                                    </div>
                              </Card>
                        </div>

                        {/* Bottom notice bar */}
                        <div className="mt-6 rounded-3xl border border-border bg-card p-4">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm">
                                          <span className="font-semibold">اعلان‌ها:</span>{' '}
                                          <span className="text-muted-foreground">کلاس شما به ساعت 17:00 تغییر کرد • تکلیف جدید Unit 5 اضافه شد</span>
                                    </div>
                                    <button className="text-sm font-medium text-primary hover:underline">
                                          مشاهده همه اعلان‌ها
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
}

/** --- Small UI helpers --- */

function Card({
      icon,
      title,
      action,
      children,
}: {
      icon?: React.ReactNode;
      title?: string;
      action?: React.ReactNode;
      children: React.ReactNode;
}) {
      return (
            <div className="rounded-3xl border border-border bg-card p-4 md:p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                              {icon && <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center">
                                    {icon}
                              </div>}

                              <div className="font-semibold">{title}</div>
                        </div>
                        {action}
                  </div>
                  {children}
            </div>
      );
}

function Dots() {
      return (
            <button
                  className="h-9 w-9 rounded-2xl border border-border bg-card hover:bg-secondary transition flex items-center justify-center"
                  aria-label="more"
            >
                  <span className="text-xl leading-none text-muted-foreground">⋯</span>
            </button>
      );
}
