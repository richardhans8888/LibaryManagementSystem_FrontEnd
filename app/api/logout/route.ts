import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  const clear = { httpOnly: false, sameSite: "lax", path: "/", maxAge: 0 };
  res.cookies.set("member_session", "", clear);
  res.cookies.set("member_public", "", clear);
  res.cookies.set("admin_session", "", clear);
  return res;
}
