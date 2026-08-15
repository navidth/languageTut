import { NavbarBrand } from "flowbite-react";
import BrandMark from "@/components/ui/BrandMark";

const Brand = () => {
  return (
    <NavbarBrand as="div" className="mx-1 sm:mx-3">
      <BrandMark variant="wordmark" />
    </NavbarBrand>
  );
};

export default Brand;
