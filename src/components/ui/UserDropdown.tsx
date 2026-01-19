import { Dropdown, DropdownHeader, DropdownItem } from 'flowbite-react'
import Link from 'next/link'
import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { BsPersonCircle } from 'react-icons/bs'

function UserDropdown() {

      const handleLogout = () => {
            console.log("first")
      }

      return (
            <Dropdown
                  aria-label="منوی کاربر"
                  dismissOnClick
                  color="light"
                  className="rounded-lg"
                  label={
                        <span className="flex items-center gap-2">
                              <BsPersonCircle className="h-5 w-5" />
                              <span>کاربر مهمان</span>
                        </span>
                  }
            >
                  <DropdownHeader className="border-b border-secondary">
                        <span className="block text-sm">نوید طاهری</span>
                        <span className="block truncate text-sm font-medium">navidtaheri32@gmail.com</span>
                  </DropdownHeader>

                  <DropdownItem as={Link} href="/student/profile" icon={BsPersonCircle} className="flex items-center gap-2 justify-start">
                        جزئیات پروفایل
                  </DropdownItem>

                  <DropdownItem icon={BiLogOut} onClick={handleLogout} className="flex items-center gap-2 justify-start text-red-500 ">
                        خروج
                  </DropdownItem>
            </Dropdown>
      )
}

export default UserDropdown