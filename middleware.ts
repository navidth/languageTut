import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
      const { pathname } = request.nextUrl;

      // فقط مسیر /student
      if (pathname.startsWith("/student")) {
            const role = request.cookies.get("role")?.value;
            
            if (role !== "student") {
                  return NextResponse.redirect(new URL("/", request.url));
            }
            console.log("role", role)
      }

      return NextResponse.next();
}

export const config = {
      matcher: ["/student/:path*"],
};
