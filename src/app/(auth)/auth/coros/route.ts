import { handleCorosAuthCode } from "@features/coros/actions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  let isVerified = false;
  try {
    if (!code) {
      throw new Error("no code returns by COROS");
    }
    isVerified = await handleCorosAuthCode(code);
  } catch (e) {
    console.info("Failed to authorize:", (e as Error).message);
  }

  redirect(isVerified ? "/?result=done" : "/?result=failed");
}
