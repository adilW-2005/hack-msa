import { NextResponse } from "next/server";

import { getUsers } from "@/lib/demo-store";
import { ROLE_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const { userId } = (await request.json()) as { userId?: string };
  const users = getUsers();
  const exists = users.some((user) => user.id === userId);

  if (!exists || !userId) {
    return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ROLE_COOKIE_NAME, userId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
