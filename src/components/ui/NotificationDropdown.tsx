'use client'

import { Dropdown, DropdownHeader, DropdownItem } from 'flowbite-react'
import { HiBell } from 'react-icons/hi'
import { BsDot } from 'react-icons/bs'

const notifications = [
      {
            id: 1,
            title: 'پروفایل شما کامل شد',
            description: 'اطلاعات کاربری با موفقیت ثبت شد',
            time: '۵ دقیقه پیش',
            unread: true,
      },
      {
            id: 2,
            title: 'کلاس جدید اضافه شد',
            description: 'درس React پیشرفته فعال شد',
            time: '۲ ساعت پیش',
            unread: false,
      },
]

const NotificationDropdown = () => {
      const unreadCount = notifications.filter(n => n.unread).length

      return (
            <Dropdown
                  inline
                  dismissOnClick={false}
                  placement="bottom-end"
                  aria-label="نوتیفیکیشن‌ها"
                  className="rounded-xl border border-border !bg-popover text-center !text-popover-foreground shadow-[var(--shadow-brand-md)]"
                  label={
                        <div className="relative">
                              <HiBell className="h-6 w-6 text-brand-secondary dark:text-brand-accent" />

                              {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-brand-primary">
                                          {unreadCount}
                                    </span>
                              )}
                        </div>
                  }
            >
                  <DropdownHeader className="border-b border-border bg-secondary-soft text-foreground">
                        <span className="block text-sm font-semibold">
                              اعلان‌ها
                        </span>
                  </DropdownHeader>

                  {notifications.length === 0 && (
                        <DropdownItem disabled>
                              نوتیفیکیشنی وجود ندارد
                        </DropdownItem>
                  )}

                  {notifications.map((item) => (
                        <DropdownItem key={item.id} className="gap-2 hover:!bg-accent-soft">
                              <div className="flex flex-col text-right">
                                    <div className="flex items-center gap-1">
                                          {item.unread && (
                                                <BsDot className="text-xl text-brand-accent" />
                                          )}
                                          <span className="text-sm font-medium">
                                                {item.title}
                                          </span>
                                    </div>

                                    <span className="text-xs text-muted-foreground">
                                          {item.description}
                                    </span>

                                    <span className="mt-1 text-[10px] text-muted-foreground/75">
                                          {item.time}
                                    </span>
                              </div>
                        </DropdownItem>
                  ))}
            </Dropdown>
      )
}

export default NotificationDropdown
