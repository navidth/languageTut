import NotificationDropdown from "@/components/ui/NotificationDropdown";
import UserDropdown from "@/components/ui/UserDropdown";
import BrandMark from "@/components/ui/BrandMark";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 w-full items-center border-b border-border bg-[var(--glass)] px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex w-full items-center gap-3">
        {/* Phones have no sidebar, so the header carries the logo. */}
        <BrandMark variant="wordmark" prefetch={false} className="sm:hidden dark:hidden" />
        <BrandMark variant="wordmark" inverse prefetch={false} className="hidden dark:inline-flex dark:sm:hidden" />
        <div className="ms-auto flex items-center gap-3 sm:gap-4">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
