import { NavbarBrand } from "flowbite-react"

const Brand = () => {
      return (
            <NavbarBrand href="/" className="mx-3">
                  {/* <Image
              src="/favicon.svg"
              width={28}
              height={28}
              className="mr-3"
              alt="Logo"
            /> */}
                  <span
                        className="
                self-center 
                whitespace-nowrap 
                text-xl 
                font-bold 
                text-zinc-800
              ">
                        LOGO
                  </span>
            </NavbarBrand >
      )
}

export default Brand