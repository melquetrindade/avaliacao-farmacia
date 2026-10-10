import "server-only";

import { db } from "../_lib/prisma";

export async function getFuncionarios() {
  return db.colaborador.findMany({
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      fotoUrl: true,
    },
  });
}