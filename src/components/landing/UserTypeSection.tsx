import { Button } from "flowbite-react";
import { HiAcademicCap, HiUserGroup, HiArrowLeft } from "react-icons/hi";

export default function UserTypeSection() {
      return (
            <section className="py-28 bg-secondary">
                  <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
                              مسیر خودت را انتخاب کن
                        </h2>
                        <p className="text-center text-muted-foreground mb-16">
                              تجربه‌ای متفاوت برای زبان‌آموزها و مدرس‌ها
                        </p>

                        <div className="grid md:grid-cols-2 gap-10">
                              {/* Learner Card */}
                              <div className="relative group rounded-3xl bg-background p-10 border border-border shadow-sm hover:shadow-xl transition">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                          <HiAcademicCap className="w-7 h-7" />
                                    </div>

                                    <h3 className="text-2xl font-semibold mb-3">
                                          زبان‌آموز هستم
                                    </h3>

                                    <p className="text-muted-foreground mb-6">
                                          مسیر یادگیری شخصی‌سازی‌شده با کمک هوش مصنوعی
                                    </p>

                                    <ul className="space-y-3 text-sm text-muted-foreground mb-10">
                                          <li className="flex gap-2 items-start">
                                                <span className="text-primary">•</span>
                                                برنامه یادگیری متناسب با هدف شما
                                          </li>
                                          <li className="flex gap-2 items-start">
                                                <span className="text-primary">•</span>
                                                انتخاب مدرس بر اساس سطح و نیاز
                                          </li>
                                          <li className="flex gap-2 items-start">
                                                <span className="text-primary">•</span>
                                                تحلیل پیشرفت و پیشنهاد هوشمند
                                          </li>
                                    </ul>

                                    <Button pill className="w-full group">
                                          شروع یادگیری
                                    </Button>
                              </div>

                              {/* Teacher Card */}
                              <div className="relative group rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-10 shadow-lg hover:shadow-2xl transition">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                                          <HiUserGroup className="w-7 h-7" />
                                    </div>

                                    <h3 className="text-2xl font-semibold mb-3">
                                          مدرس هستم
                                    </h3>

                                    <p className="text-zinc-300 mb-6">
                                          کلاس‌ها، شاگردان و درآمدت را هوشمند مدیریت کن
                                    </p>

                                    <ul className="space-y-3 text-sm text-zinc-300 mb-10">
                                          <li className="flex gap-2 items-start">
                                                <span className="text-white">•</span>
                                                جذب شاگرد بدون واسطه
                                          </li>
                                          <li className="flex gap-2 items-start">
                                                <span className="text-white">•</span>
                                                پنل مدیریت کلاس‌ها
                                          </li>
                                          <li className="flex gap-2 items-start">
                                                <span className="text-white">•</span>
                                                گزارش عملکرد و درآمد شفاف
                                          </li>
                                    </ul>

                                    <Button pill color="light" className="w-full">
                                          شروع تدریس
                                    </Button>
                              </div>
                        </div>
                  </div>
            </section>
      );
}
