import { redirect } from "next/navigation";

import { ROLE_HOME } from "@/lib/format";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();
  redirect(ROLE_HOME[user.role]);
}
