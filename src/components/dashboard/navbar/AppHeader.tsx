import NotificationDropdown from "@/components/ui/NotificationDropdown";
import UserDropdown from "@/components/ui/UserDropdown";
import BrandMark from "@/components/ui/BrandMark";

const AppHeader = () => {

      return (
            <header className="sticky top-0 z-40 flex min-h-16 w-full items-center justify-end border-b border-border bg-[var(--glass)] px-4 py-3 shadow-sm backdrop-blur-xl">
                  <div className="flex w-full items-center justify-between gap-4 sm:flex-row-reverse sm:justify-start">
                        <UserDropdown />
                        <NotificationDropdown />
                        <BrandMark compact className="sm:hidden" />
                  </div>
            </header>
      );
};

export default AppHeader;
