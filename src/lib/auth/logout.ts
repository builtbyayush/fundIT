"use server";

import { signOut } from "@/auth";

export async function logoutAction(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/login");
  await signOut({ redirectTo });
}
