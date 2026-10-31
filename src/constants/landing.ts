import { HiOutlineClipboardCheck, HiOutlineAdjustments, HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineFlag, HiOutlineEye, HiAcademicCap, HiUserGroup, HiSparkles, HiOutlineVolumeUp, HiOutlinePencilAlt, HiOutlineBookOpen, HiChartBar, HiOutlineChatAlt2, HiOutlineMicrophone, HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineQuestionMarkCircle, HiOutlineChartPie, HiOutlineUserGroup, HiOutlinePresentationChartLine, HiOutlineAnnotation, HiOutlineLightBulb, HiOutlineMap, HiOutlineTrendingUp, HiOutlineCollection } from "react-icons/hi";
import type { IconType } from "react-icons";
import { PLACEMENT_SECTION_ID } from "@/constants/routes";

export const aboutApproachSteps = [
  {
    icon: HiOutlineClipboardCheck,
    title: "سنجش",
    text: "هر مسیر با شناخت دقیق سطح فعلی آغاز می‌شود، نه با حدس.",
  },
  {
    icon: HiOutlineAdjustments,
    title: "برنامه",
    text: "سطح و هدف به مسیری روشن از دوره‌ها و درس‌ها تبدیل می‌شود.",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "تمرین",
    text: "تمرین‌ها بر چهار مهارت و نیازهای واقعی هر سطح تمرکز دارند.",
  },
  {
    icon: HiOutlineChartBar,
    title: "بازخورد",
    text: "نتیجه‌ها و بازخوردها نشان می‌دهند قدم بعدی چه باشد.",
  },
] as const;

export const aboutStoryPillars = [
  {
    icon: HiOutlineFlag,
    title: "مأموریت ما",
    text: "کمک به هر زبان‌آموز برای یافتن مسیری متناسب با سطح و هدفش، و دادن ابزارهای دقیق‌تر به مدرس‌ها برای همراهی او.",
  },
  {
    icon: HiOutlineEye,
    title: "چشم‌انداز ما",
    text: "تجربه‌ای از یادگیری زبان که در آن هر جلسه تمرین به پیشرفتی قابل‌مشاهده تبدیل شود.",
  },
] as const;

export const aboutPrinciples = [
  {
    icon: HiAcademicCap,
    title: "یادگیری هدفمند",
    text: "هر تمرین باید به یک نیاز روشن در مسیر زبان‌آموز پاسخ دهد.",
  },
  {
    icon: HiUserGroup,
    title: "همراهی انسانی",
    text: "فناوری ابزار مدرس و زبان‌آموز است، نه جایگزین ارتباط میان آن‌ها.",
  },
  {
    icon: HiSparkles,
    title: "هوشمندی کاربردی",
    text: "هوش مصنوعی باید انتخاب قدم بعدی را دقیق‌تر و ساده‌تر کند.",
  },
] as const;

export const PREVIEW_CURRENT_LEVEL = 2;

export const PREVIEW_TARGET_LEVEL = 4;

export const previewPractice: { icon: IconType; skill: string; title: string; progress: number }[] = [
  { icon: HiOutlineVolumeUp, skill: "Listening", title: "گفت‌وگوهای روزمره", progress: 72 },
  { icon: HiOutlinePencilAlt, skill: "Writing", title: "نوشتن ایمیل رسمی", progress: 40 },
  { icon: HiOutlineBookOpen, skill: "Reading", title: "درک مطلب کوتاه", progress: 18 },
];

// The Iranian week starts on Saturday; Thursday is "today", Friday is still ahead.
export const previewWeek = [
  { day: "ش", value: 40 },
  { day: "ی", value: 65 },
  { day: "د", value: 30 },
  { day: "س", value: 80 },
  { day: "چ", value: 55 },
  { day: "پ", value: 90, today: true },
  { day: "ج", value: 8, ahead: true },
];

export const previewBreakdown = [
  { label: "تحویل‌شده", share: 64, bar: "bg-success", dot: "bg-success" },
  { label: "منتظر بازخورد", share: 22, bar: "bg-brand-accent", dot: "bg-brand-accent" },
  { label: "دیر تحویل", share: 14, bar: "bg-destructive", dot: "bg-destructive" },
] as const;

export const previewSubmissions = [
  { initial: "س", name: "سارا محمدی", time: "۲ ساعت پیش", status: "تحویل‌شده", tone: "bg-success-soft text-success", score: "۱۸٫۵" },
  { initial: "ا", name: "امیر حسینی", time: "امروز", status: "منتظر بازخورد", tone: "bg-accent-soft text-warning", score: "—" },
  { initial: "ن", name: "نگار کریمی", time: "دیروز", status: "دیر تحویل", tone: "bg-destructive-soft text-destructive", score: "۱۴" },
  { initial: "م", name: "محمد رضایی", time: "دیروز", status: "تحویل‌شده", tone: "bg-success-soft text-success", score: "۱۷" },
] as const;

export const faqItems = [
  {
    question: "برای شروع یادگیری زبان از کجا باید شروع کنم؟",
    answer:
      "بهترین نقطه شروع، آزمون تعیین سطح است. پس از شناخت سطح فعلی، می‌توانید دوره‌ها و تمرین‌هایی را انتخاب کنید که با هدف و توانایی شما هماهنگ‌اند.",
  },
  {
    question: "آزمون تعیین سطح ExamificatioN چه کمکی می‌کند؟",
    answer:
      "این آزمون تصویری روشن‌تر از مهارت‌های فعلی شما می‌سازد تا مسیر آموزشی نه بیش از حد ساده باشد و نه زودتر از آمادگی شما دشوار شود.",
  },
  {
    question: "آیا مسیر یادگیری برای هر زبان‌آموز متفاوت است؟",
    answer:
      "بله. سطح فعلی، هدف، روند تمرین و نقاط نیازمند تقویت در پیشنهاد مسیر اثر می‌گذارند تا تجربه یادگیری با شرایط هر زبان‌آموز هماهنگ‌تر باشد.",
  },
  {
    question: "کدام مهارت‌های زبان انگلیسی پوشش داده می‌شوند؟",
    answer:
      "مسیر آموزشی بر چهار مهارت اصلی خواندن، شنیدن، نوشتن و صحبت‌کردن تمرکز دارد و به واژگان و دستور زبان موردنیاز هر سطح نیز توجه می‌کند.",
  },
  {
    question: "مدرس‌ها چه امکاناتی در اختیار دارند؟",
    answer:
      "مدرس می‌تواند کلاس‌ها و زبان‌آموزان را از یک فضای یکپارچه مدیریت کند، روند یادگیری را ببیند و بر اساس عملکرد هر فرد بازخورد دقیق‌تری ارائه دهد.",
  },
] as const;

export const extraPaths = [
  {
    icon: HiChartBar,
    title: "آمادگی تخصصی IELTS",
    text: "دوره‌ها، آزمون‌های آزمایشی و مسیر تخصصی آمادگی آیلتس.",
    href: "/ielts",
    available: false,
  },
  {
    icon: HiSparkles,
    title: "دستیار هوشمند یادگیری",
    text: "تمرین، تحلیل پیشرفت و پیشنهاد مسیر با کمک هوش مصنوعی.",
    href: "/ai",
    available: false,
  },
  {
    icon: HiOutlineChatAlt2,
    title: "مشاوره آنلاین",
    text: "راهنمایی برای انتخاب دوره و مسیر یادگیری، از راه تماس یا تلگرام.",
    href: "/consultation",
    available: true,
  },
] as const;

// The level drawn as "your level" in the illustration.
export const FEATURE_SAMPLE_LEVEL = "B1";

export const learnerFeatureSkills = [
  { icon: HiOutlineVolumeUp, english: "Listening", persian: "شنیداری" },
  { icon: HiOutlineMicrophone, english: "Speaking", persian: "گفتاری" },
  { icon: HiOutlineBookOpen, english: "Reading", persian: "خواندن" },
  { icon: HiOutlinePencilAlt, english: "Writing", persian: "نوشتاری" },
] as const;

export const learnerFeatureTools = [
  {
    icon: HiOutlineClipboardList,
    title: "تکالیف آنلاین",
    text: "تکلیف هر درس را آنلاین ارسال کنید و وضعیت و نتیجه آن را دنبال کنید.",
  },
  {
    icon: HiOutlineDocumentText,
    title: "تمرین تستی و کارنامه",
    text: "آزمون‌های تمرینی بدهید و پس از ارسال، کارنامه پاسخ‌هایتان را مرور کنید.",
  },
  {
    icon: HiOutlineQuestionMarkCircle,
    title: "بانک سؤال",
    text: "سؤال‌های تمرینی را یک‌جا ببینید و نقاط نیازمند تقویت را هدفمند تمرین کنید.",
  },
  {
    icon: HiOutlineChartPie,
    title: "داشبورد پیشرفت",
    text: "دوره‌ها، تکالیف و روند یادگیری خود را در یک نمای خلاصه دنبال کنید.",
  },
] as const;

export const teacherTools = [
  {
    icon: HiOutlineUserGroup,
    title: "مدیریت کلاس‌ها و زبان‌آموزان",
    text: "کلاس‌ها و زبان‌آموزان هر کلاس را از یک فضای یکپارچه مدیریت کنید.",
  },
  {
    icon: HiOutlinePresentationChartLine,
    title: "دید روشن به روند عملکرد",
    text: "روند یادگیری هر زبان‌آموز را سریع‌تر ببینید و نقاط نیازمند توجه را زودتر پیدا کنید.",
  },
  {
    icon: HiOutlineAnnotation,
    title: "بازخورد دقیق‌تر",
    text: "بر اساس عملکرد هر فرد، بازخوردی بدهید که به قدم بعدی او کمک کند.",
  },
] as const;

export const howItWorksSteps = [
  {
    icon: HiOutlineClipboardCheck,
    title: "سطح فعلی‌تان را بشناسید",
    text: "با تعیین سطح شروع کنید تا نقطه آغاز مسیر بر اساس توانایی واقعی شما مشخص شود.",
  },
  {
    icon: HiOutlineLightBulb,
    title: "مسیر مناسب را دریافت کنید",
    text: "هدف و سطح شما به یک برنامه روشن از دوره‌ها، تمرین‌ها و اولویت‌های یادگیری تبدیل می‌شود.",
  },
  {
    icon: HiOutlinePresentationChartLine,
    title: "تمرین کنید و مسیر را بسنجید",
    text: "با ادامه تمرین، روند پیشرفت را ببینید و قدم‌های بعدی را دقیق‌تر انتخاب کنید.",
  },
] as const;

// IELTS sits in the middle as the featured link; the two beside it share one
// size whatever their label length.
export const placementLinks = [
  { icon: HiOutlineClipboardCheck, text: "مشاهده دوره‌ها", href: "/courses", featured: false },
  { icon: HiChartBar, text: "IELTS", href: "/ielts", featured: true },
  { icon: HiSparkles, text: "مشاوره آنلاین", href: "/consultation", featured: false },
];

export const footerGroups = [
  {
    title: "یادگیری",
    links: [
      { label: "دوره‌های زبان", href: "/courses" },
      { label: "تعیین سطح", href: `/#${PLACEMENT_SECTION_ID}` },
      { label: "مهارت‌های زبان", href: "/#skills" },
    ],
  },
  {
    title: "ExamificatioN",
    links: [
      { label: "امکانات", href: "/features" },
      { label: "نحوه کار", href: "/#how-it-works" },
      { label: "درباره ما", href: "/about" },
    ],
  },
  {
    title: "دسترسی سریع",
    links: [
      { label: "دستیار هوشمند", href: "/ai" },
      { label: "فضای مدرس‌ها", href: "/teacher" },
      { label: "سؤالات متداول", href: "/#faq" },
    ],
  },
] as const;

export const trustSkills = [
  {
    icon: HiOutlineVolumeUp,
    english: "Listening",
    persian: "مهارت شنیداری",
    text: "درک بهتر گفت‌وگوها، گویش‌ها و استفاده از واژگان کاربردی",
    accent: "bg-brand-accent text-brand-primary",
  },
  {
    icon: HiOutlineMicrophone,
    english: "Speaking",
    persian: "مهارت گفتاری",
    text: "ساخت جملات متناسب با سطر و افزایش استفاده از مکالمات روزمره",
    accent: "bg-white text-brand-secondary",
  },
  {
    icon: HiOutlineBookOpen,
    english: "Reading",
    persian: "مهارت خواندن",
    text: " درک مطلب، درک واژگان و افزایش مهارت پاسخ به سوالات",
    accent: "bg-white text-brand-secondary",
  },
  {
    icon: HiOutlinePencilAlt,
    english: "Writing",
    persian: "مهارت نوشتاری",
    text: "استفاده از واژگان و دستور زبان پرکاربرد در آزمون",
    accent: "bg-brand-accent text-brand-primary",
  },
] as const;

export const learnerBenefits: { icon: IconType; text: string }[] = [
  { icon: HiOutlineMap, text: "مسیر متناسب با سطح و هدف شما" },
  { icon: HiOutlineAdjustments, text: "تمرین هدفمند به‌جای محتوای پراکنده" },
  { icon: HiOutlineTrendingUp, text: "مشاهده روند پیشرفت در طول مسیر" },
];

export const teacherBenefits: { icon: IconType; text: string }[] = [
  { icon: HiOutlineCollection, text: "مدیریت کلاس‌ها و زبان‌آموزان" },
  { icon: HiOutlineChartBar, text: "دسترسی سریع‌تر به روند عملکرد" },
  { icon: HiOutlineChatAlt2, text: "بازخورد دقیق‌تر با ابزارهای هوشمند" },
];
