'use client'

import { HiBell, HiChevronDown } from 'react-icons/hi'
import { BsDot } from 'react-icons/bs'
import HeaderMenu, {
      headerMenuItemClassName,
      headerMenuPanelClassName,
      headerMenuTitleClassName,
} from './HeaderMenu'

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
            <HeaderMenu
                  id="dashboard-notification-menu"
                  ariaLabel="اعلان‌ها"
                  dismissOnClick={false}
                  // Negative margin widens the touch target without moving anything.
                  triggerClassName="-m-2 flex items-center rounded-xl p-2"
                  // Leaves room for the user menu button to its left on phones.
                  menuClassName={`${headerMenuPanelClassName} max-w-[calc(100vw-8rem)] text-center`}
                  label={
                        <>
                              <div className="relative">
                                    <HiBell className="h-6 w-6 text-brand-secondary dark:text-brand-accent" aria-hidden="true" />

                                    {unreadCount > 0 && (
                                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-brand-primary">
                                                {unreadCount}
                                          </span>
                                    )}
                              </div>
                              <HiChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                        </>
                  }
            >
                  <div className="py-1">
                        <div className={headerMenuTitleClassName}>
                              <span className="block text-sm font-semibold">
                                    اعلان‌ها
                              </span>
                        </div>

                        <ul role="none">
                              {notifications.length === 0 && (
                                    <li role="none">
                                          <span role="menuitem" aria-disabled="true" className={`${headerMenuItemClassName} flex items-center justify-start text-gray-700`}>
                                                نوتیفیکیشنی وجود ندارد
                                          </span>
                                    </li>
                              )}

                              {notifications.map((item) => (
                                    <li key={item.id} role="none">
                                          <button
                                                role="menuitem"
                                                tabIndex={-1}
                                                type="button"
                                                className={`${headerMenuItemClassName} flex items-center justify-start gap-2 text-gray-700 hover:!bg-accent-soft`}
                                          >
                                                <div className="flex flex-col text-right">
                                                      <div className="flex items-center gap-1">
                                                            {item.unread && (
                                                                  <BsDot className="text-xl text-brand-accent" aria-hidden="true" />
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
                                          </button>
                                    </li>
                              ))}
                        </ul>
                  </div>
            </HeaderMenu>
      )
}

export default NotificationDropdown
