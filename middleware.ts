import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
      console.log("➡️ Request:", {
            method: request.method,
            url: request.nextUrl.pathname,
      });

      return NextResponse.next();
}
export const config = {
      matcher: ["/dashboard/:path*", "/api/:path*"],
};
