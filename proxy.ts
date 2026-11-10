import { NextRequest, NextResponse } from "next/server";

//runs before each page: no token = no access to the connected pages
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/register";

  //the backend refused the token (lib/api.ts): remove it here, pages can't delete a cookie
  if (path === "/logout") {
    //a link on another site must not log the user out
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  //every page, except next.js files and files with a dot (logo.svg)
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
