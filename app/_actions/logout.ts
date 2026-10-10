"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "../_lib/auth";

export async function logout() {
  await deleteSession();
  redirect("/admin");
}
