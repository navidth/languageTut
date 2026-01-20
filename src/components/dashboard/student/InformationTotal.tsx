import React from 'react';
import { GrDocumentUser } from 'react-icons/gr';
import { HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';

type InfoItem = {
  id: number;
  title: string;
  value: string | number;
  unit?: string; // مثل "ساعت"
  icon: React.ElementType;
  dotVariant?: 'cta' | 'primary' | 'accent';
  badge?: string; // اختیاری مثل "این ماه"
};

const dotMap: Record<NonNullable<InfoItem['dotVariant']>, string> = {
  cta: '[oklch(var(--chart-1))]',
  primary: 'primary',
  accent: 'accent',
};

const InformationTotal = () => {
  // بعداً می‌تونی از API بگیری و همین آرایه رو پر کنی
  const items: InfoItem[] = [
    {
      id: 1,
      title: 'کل دوره‌های ثبت‌نام شده',
      value: 5,
      icon: GrDocumentUser,
      dotVariant: 'primary',
    },
    {
      id: 2,
      title: 'تعداد دوره‌های انجام شده',
      value: 1,
      icon: HiOutlineCheckCircle,
      dotVariant: 'accent',
      badge: 'تا امروز',
    },
    {
      id: 3,
      title: 'تعداد ساعت گذرانده شده',
      value: 124,
      unit: 'ساعت',
      icon: HiOutlineClock,
      dotVariant: 'cta',
      badge: 'مجموع',
    },
  ];

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-2xl  px-0 py-3"
          >
            <div className="flex items-center gap-1">
              {/* Dot */}
              <span
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  item.dotVariant ? `bg-${dotMap[item.dotVariant]}` : 'bg-primary',
                ].join(' ')}
              />

              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary ml-1">
                <Icon className={`h-5 w-5 ${item.dotVariant ? `text-${dotMap[item.dotVariant]}` : "bg-primary"}`} />
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <div className="font-medium">{item.title}</div>
                {item.badge ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.badge}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right: Value */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground">
                  {item.value}
                  {item.unit ? (
                    <span className="mr-1 text-sm font-medium text-muted-foreground">
                      {item.unit}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default InformationTotal;
