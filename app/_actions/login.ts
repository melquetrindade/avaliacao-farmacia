"use server";

import argon2 from "argon2";
import { redirect } from "next/navigation";
import { createSession } from "../_lib/auth";
import { db } from "../_lib/prisma";

type LoginState = {
  error: string | null;
};

const INVALID_CREDENTIALS_MESSAGE =
  "Email ou senha incorretos, tente novamente";

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  const administrator = await db.administrador.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (
    !administrator ||
    !(await argon2.verify(administrator.senhaHash, password))
  ) {
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  await createSession(administrator.id);
  redirect("/admin/dashboard");
}