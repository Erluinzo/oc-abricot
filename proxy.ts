import { NextRequest, NextResponse } from "next/server";

//runs before each page: no token = no access to the connected pages
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/register";

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  //every page, except next.js files, files with a dot (logo.svg) and /logout
  matcher: ["/((?!_next/|logout|.*\\..*).*)"],
};
