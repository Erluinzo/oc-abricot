import { cookies } from "next/headers";
import { redirect } from "next/navigation";

//used when the backend refuses the token: pages can't delete a cookie, this route can
export async function GET() {
  (await cookies()).delete("token");
  redirect("/login");
}
