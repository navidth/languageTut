import { NavbarBrand } from "flowbite-react";
import BrandMark from "@/components/ui/BrandMark";

const Brand = () => {
  return (
    <NavbarBrand as="div" className="mx-1 sm:mx-3">
      <BrandMark variant="primary" className="dark:hidden" />
      <BrandMark variant="primary" inverse className="hidden dark:inline-flex" />
    </NavbarBrand>
  );
};

export default Brand;
