/**
 * Role switcher — reads/writes the lumen_user_id cookie.
 * No real auth; just a cookie with a user ID for demo purposes.
 */
import { USERS } from "./mock-data";

export const DEFAULT_USER_ID = "user_dana";

export function getUserById(id: string) {
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

export function getAllUsers() {
  return USERS;
}
