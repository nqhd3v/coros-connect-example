import { logout } from "@features/coros/actions";
import { redirect } from "next/navigation";

export async function GET() {
  await logout();
  return redirect("/");
}
