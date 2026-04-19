import { NextResponse } from "next/server";
import { z } from "zod";

import { getUsers } from "@/lib/demo-store";
import { ROLE_COOKIE_NAME } from "@/lib/session";

const requestSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  const { userId } = requestSchema.parse(await request.json());
  const users = await getUsers();
  const exists = users.some((user) => user.id === userId);

  if (!exists) {
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
