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
                  className='rounded-lg text-center'
                  label={
                        <div className="relative">
                              <HiBell className="h-6 w-6 text-gray-700" />

                              {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                                          {unreadCount}
                                    </span>
                              )}
                        </div>
                  }
            >
                  <DropdownHeader>
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
                        <DropdownItem key={item.id} className="gap-2">
                              <div className="flex flex-col text-right">
                                    <div className="flex items-center gap-1">
                                          {item.unread && (
                                                <BsDot className="text-blue-600 text-xl" />
                                          )}
                                          <span className="text-sm font-medium">
                                                {item.title}
                                          </span>
                                    </div>

                                    <span className="text-xs text-gray-500">
                                          {item.description}
                                    </span>

                                    <span className="mt-1 text-[10px] text-gray-400">
                                          {item.time}
                                    </span>
                              </div>
                        </DropdownItem>
                  ))}
            </Dropdown>
      )
}

export default NotificationDropdown
