import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/student")) {
            const role = request.cookies.get("role")?.value;

            if (role !== "student") {
                  return NextResponse.redirect(new URL("/", request.url));
            }
      }

      if (pathname.startsWith("/teacher")) {
            const role = request.cookies.get("role")?.value;

            if (role !== "teacher") {
                  return NextResponse.redirect(new URL("/", request.url));
            }
      }

      return NextResponse.next();
}

export const config = {
      matcher: ["/student/:path*", "/teacher/:path*"],
};
