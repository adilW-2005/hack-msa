import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser, getUsers } from "@/lib/demo-store";
import { ROLE_HOME } from "@/lib/format";

export const ROLE_COOKIE_NAME = "lumen_user_id";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  return getCurrentUser(userId);
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    const [fallback] = await getUsers();
    redirect(ROLE_HOME[fallback.role]);
  }

  return user;
}
