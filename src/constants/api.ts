export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://2.144.27.2:8000";

/**
 * An access token this close to its `exp` is renewed before the request goes
 * out, so the request never reaches the server with a token that just expired.
 */
export const ACCESS_TOKEN_SKEW_MS = 30_000;

export const fieldLabels: Record<string, string> = {
  detail: "خطا",
  non_field_errors: "اطلاعات",
  email: "ایمیل",
  password: "رمز عبور",
  full_name: "نام و نام خانوادگی",
  current_level: "سطح زبان",
  current_password: "رمز عبور فعلی",
  phone_number: "شماره موبایل",
  new_password: "رمز عبور جدید",
  code: "کد تأیید",
  refresh: "نشست کاربری",
  token: "نشست کاربری",
  file: "فایل",
  notes: "توضیحات",
};

export const defaultStatusMessages: Record<number, string> = {
  400: "اطلاعات ارسال‌شده معتبر نیست. لطفاً ورودی‌ها را بررسی کنید.",
  401: "اطلاعات ورود معتبر نیست یا نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
  402: "برای انجام این عملیات، وضعیت پرداخت حساب را بررسی کنید.",
  403: "شما اجازه انجام این عملیات را ندارید.",
  404: "اطلاعات یا صفحه درخواستی پیدا نشد.",
  405: "این عملیات برای مسیر درخواستی مجاز نیست.",
  408: "زمان پاسخ‌گویی سرور به پایان رسید. دوباره تلاش کنید.",
  409: "این عملیات با وضعیت فعلی اطلاعات تداخل دارد. صفحه را به‌روز کرده و دوباره تلاش کنید.",
  410: "اطلاعات درخواستی دیگر در دسترس نیست.",
  413: "حجم فایل یا اطلاعات ارسالی بیشتر از حد مجاز است.",
  415: "نوع فایل یا محتوای ارسالی پشتیبانی نمی‌شود.",
  422: "سرور نتوانست اطلاعات ارسالی را پردازش کند. ورودی‌ها را بررسی کنید.",
  500: "خطایی در سرور رخ داد. لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
  501: "این قابلیت هنوز در سرور پیاده‌سازی نشده است.",
  502: "پاسخ معتبری از سرویس بالادستی دریافت نشد. کمی بعد دوباره تلاش کنید.",
  503: "سرویس موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.",
  504: "پاسخ سرویس بیش از حد طول کشید. دوباره تلاش کنید.",
};

export const successStatusMessages: Record<number, string> = {
  200: "عملیات با موفقیت انجام شد.",
  201: "اطلاعات با موفقیت ثبت شد.",
  202: "درخواست با موفقیت دریافت شد و در حال پردازش است.",
  204: "عملیات با موفقیت انجام شد.",
};

export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * How long Next keeps a public server read (courses, sitemap) before it
 * fetches again in the background. Route `revalidate` exports must be
 * literals, so they repeat this value.
 */
export const PUBLIC_REVALIDATE_SECONDS = 300;
