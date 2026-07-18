import AuthModalButton from "../auth/AuthModalButton";
import { HiAcademicCap, HiUserGroup } from "react-icons/hi";

export default function UserTypeSection() {
      return (
            <section className="bg-secondary py-28">
                  <div className="mx-auto max-w-6xl px-6">
                        <h2 className="mb-4 text-center text-4xl font-bold text-foreground">
                              مسیر خودت را انتخاب کن
                        </h2>
                        <p className="mb-16 text-center text-muted-foreground">
                              تجربه ای متفاوت برای زبان آموزها و مدرس ها
                        </p>

                        <div className="grid gap-10 md:grid-cols-2">
                              <div className="group relative rounded-3xl border border-border bg-background p-10 shadow-sm transition hover:shadow-xl">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                          <HiAcademicCap className="h-7 w-7" />
                                    </div>

                                    <h3 className="mb-3 text-2xl font-semibold">
                                          زبان آموز هستم
                                    </h3>

                                    <p className="mb-6 text-muted-foreground">
                                          مسیر یادگیری شخصی سازی شده با کمک هوش مصنوعی
                                    </p>

                                    <ul className="mb-10 space-y-3 text-sm text-muted-foreground">
                                          <li className="flex items-start gap-2">
                                                <span className="text-primary">•</span>
                                                برنامه یادگیری متناسب با هدف شما
                                          </li>
                                          <li className="flex items-start gap-2">
                                                <span className="text-primary">•</span>
                                                انتخاب مدرس بر اساس سطح و نیاز
                                          </li>
                                          <li className="flex items-start gap-2">
                                                <span className="text-primary">•</span>
                                                تحلیل پیشرفت و پیشنهاد هوشمند
                                          </li>
                                    </ul>

                                    <AuthModalButton className="w-full group" fullWidth>
                                          شروع یادگیری
                                    </AuthModalButton>
                              </div>

                              <div className="group relative rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-10 text-white shadow-lg transition hover:shadow-2xl">
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                                          <HiUserGroup className="h-7 w-7" />
                                    </div>

                                    <h3 className="mb-3 text-2xl font-semibold">
                                          مدرس هستم
                                    </h3>

                                    <p className="mb-6 text-zinc-300">
                                          کلاس ها، شاگردان و درآمدت را هوشمند مدیریت کن
                                    </p>

                                    <ul className="mb-10 space-y-3 text-sm text-zinc-300">
                                          <li className="flex items-start gap-2">
                                                <span className="text-white">•</span>
                                                جذب شاگرد بدون واسطه
                                          </li>
                                          <li className="flex items-start gap-2">
                                                <span className="text-white">•</span>
                                                پنل مدیریت کلاس ها
                                          </li>
                                          <li className="flex items-start gap-2">
                                                <span className="text-white">•</span>
                                                گزارش عملکرد و درآمد شفاف
                                          </li>
                                    </ul>

                                    <AuthModalButton color="light" className="w-full" fullWidth>
                                          شروع تدریس
                                    </AuthModalButton>
                              </div>
                        </div>
                  </div>
            </section>
      );
}
