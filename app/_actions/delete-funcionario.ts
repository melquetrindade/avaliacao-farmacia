"use server";

import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../_lib/auth";
import { db } from "../_lib/prisma";

export type DeleteFuncionarioState = {
  error: string | null;
  success: boolean;
  warning: string | null;
};

function getCloudinaryPublicId(imageUrl: string, cloudName: string) {
  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);

    if (url.hostname !== "res.cloudinary.com" || segments[0] !== cloudName) {
      return null;
    }

    const uploadIndex = segments.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    const assetSegments = segments.slice(uploadIndex + 1);

    if (assetSegments[0]?.match(/^v\d+$/)) {
      assetSegments.shift();
    }

    const lastSegmentIndex = assetSegments.length - 1;
    const fileName = assetSegments[lastSegmentIndex];

    if (!fileName) {
      return null;
    }

    assetSegments[lastSegmentIndex] = fileName.replace(/\.[^.]+$/, "");
    return assetSegments.map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
}

function isForeignKeyConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2003"
  );
}

export async function deleteFuncionario(
  _previousState: DeleteFuncionarioState,
  formData: FormData,
): Promise<DeleteFuncionarioState> {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return {
      error: "Funcionário inválido.",
      success: false,
      warning: null,
    };
  }

  const funcionario = await db.colaborador.findUnique({
    where: { id },
    select: { fotoUrl: true },
  });

  if (!funcionario) {
    return {
      error: "Funcionário não encontrado.",
      success: false,
      warning: null,
    };
  }

  try {
    await db.colaborador.delete({ where: { id } });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return {
        error:
          "Não é possível excluir este funcionário porque há registros vinculados a ele.",
        success: false,
        warning: null,
      };
    }

    console.error("Falha ao excluir o funcionário:", error);
    return {
      error: "Não foi possível excluir o funcionário. Tente novamente.",
      success: false,
      warning: null,
    };
  }

  let warning: string | null = null;

  if (funcionario.fotoUrl) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      warning =
        "O funcionário foi excluído, mas a imagem não pôde ser removida porque o Cloudinary não está configurado.";
    } else {
      const publicId = getCloudinaryPublicId(funcionario.fotoUrl, cloudName);

      if (!publicId) {
        warning =
          "O funcionário foi excluído, mas não foi possível identificar a imagem para removê-la do Cloudinary.";
      } else {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });

          if (result.result !== "ok" && result.result !== "not found") {
            throw new Error(`Cloudinary retornou: ${result.result}`);
          }
        } catch (error) {
          console.error(
            "Falha ao remover a imagem do funcionário do Cloudinary:",
            error,
          );
          warning =
            "O funcionário foi excluído, mas não foi possível remover sua imagem do Cloudinary. Verifique o armazenamento de imagens.";
        }
      }
    }
  }

  revalidatePath("/admin/funcionarios");
  return { error: null, success: true, warning };
}