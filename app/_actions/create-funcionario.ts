"use server";

import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../_lib/auth";
import { db } from "../_lib/prisma";

export type CreateFuncionarioState = {
  error: string | null;
  success: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DUPLICATE_NAME_ERROR =
  "Erro ao cadastrar funcionários, o nome já está em uso";

function isDuplicateNameError(error: unknown) {
  if (!(error instanceof Error) || !("code" in error) || error.code !== "P2002") {
    return false;
  }

  return (
    !("meta" in error) ||
    !error.meta ||
    typeof error.meta !== "object" ||
    !("target" in error.meta) ||
    (Array.isArray(error.meta.target)
      ? error.meta.target.includes("nomeNormalizado")
      : error.meta.target === "nomeNormalizado")
  );
}

export async function createFuncionario(
  _previousState: CreateFuncionarioState,
  formData: FormData,
): Promise<CreateFuncionarioState> {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const nome = formData.get("nome");
  const foto = formData.get("foto");

  if (typeof nome !== "string" || !nome.trim()) {
    return { error: "Informe o nome do funcionário.", success: false };
  }

  if (nome.trim().length > 120) {
    return {
      error: "O nome deve ter no máximo 120 caracteres.",
      success: false,
    };
  }

  const nomeNormalizado = nome.trim().toLocaleLowerCase("pt-BR");
  const existingFuncionario = await db.colaborador.findUnique({
    where: { nomeNormalizado },
    select: { id: true },
  });

  if (existingFuncionario) {
    return { error: DUPLICATE_NAME_ERROR, success: false };
  }

  if (!(foto instanceof File) || foto.size === 0) {
    return { error: "Selecione uma imagem para o funcionário.", success: false };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(foto.type)) {
    return {
      error: "Escolha uma imagem nos formatos JPG, PNG ou WebP.",
      success: false,
    };
  }

  if (foto.size > MAX_IMAGE_SIZE) {
    return {
      error: "A imagem deve ter no máximo 5 MB.",
      success: false,
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      error: "O armazenamento de imagens não está configurado.",
      success: false,
    };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  let uploadedImage: UploadApiResponse;

  try {
    uploadedImage = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "farmacia/funcionarios",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result) {
            reject(new Error("Cloudinary não retornou a imagem enviada."));
          } else {
            resolve(result);
          }
        },
      );

      void foto
        .arrayBuffer()
        .then((arrayBuffer) => uploadStream.end(Buffer.from(arrayBuffer)))
        .catch(reject);
    });
  } catch (error) {
    console.error("Falha ao enviar a imagem do funcionário:", error);
    return {
      error: "Não foi possível enviar a imagem. Tente novamente.",
      success: false,
    };
  }

  try {
    await db.colaborador.create({
      data: {
        nome: nome.trim(),
        nomeNormalizado,
        fotoUrl: uploadedImage.secure_url,
      },
    });
  } catch (error) {
    try {
      await cloudinary.uploader.destroy(uploadedImage.public_id, {
        resource_type: "image",
      });
    } catch (cleanupError) {
      console.error("Falha ao remover imagem órfã do Cloudinary:", cleanupError);
    }

    if (isDuplicateNameError(error)) {
      return { error: DUPLICATE_NAME_ERROR, success: false };
    }

    console.error("Falha ao salvar o funcionário:", error);
    return {
      error: "Não foi possível cadastrar o funcionário. Tente novamente.",
      success: false,
    };
  }

  revalidatePath("/admin/funcionarios");

  return { error: null, success: true };
}
