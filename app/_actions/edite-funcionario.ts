"use server";

import "server-only";

import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../_lib/auth";
import { db } from "../_lib/prisma";

export type EditFuncionarioState = {
  error: string | null;
  success: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DUPLICATE_NAME_ERROR =
  "Erro ao editar funcionário, o nome já está em uso.";

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

function getCloudinaryPublicId(imageUrl: string, cloudName: string) {
  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);

    if (
      url.hostname !== "res.cloudinary.com" ||
      segments[0] !== cloudName
    ) {
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

async function uploadImage(foto: File) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
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
}

async function removeUploadedImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export async function editarFuncionario(
  _previousState: EditFuncionarioState,
  formData: FormData,
): Promise<EditFuncionarioState> {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const id = formData.get("id");
  const nome = formData.get("nome");
  const foto = formData.get("foto");

  if (typeof id !== "string" || !id) {
    return { error: "Funcionário inválido.", success: false };
  }

  if (typeof nome !== "string" || !nome.trim()) {
    return { error: "Informe o nome do funcionário.", success: false };
  }

  if (nome.trim().length > 120) {
    return {
      error: "O nome deve ter no máximo 120 caracteres.",
      success: false,
    };
  }

  const funcionario = await db.colaborador.findUnique({
    where: { id },
    select: { nome: true, nomeNormalizado: true, fotoUrl: true },
  });

  if (!funcionario) {
    return { error: "Funcionário não encontrado.", success: false };
  }

  const nomeNormalizado = nome.trim().toLocaleLowerCase("pt-BR");
  const existingFuncionario = await db.colaborador.findFirst({
    where: { nomeNormalizado, id: { not: id } },
    select: { id: true },
  });

  if (existingFuncionario) {
    return { error: DUPLICATE_NAME_ERROR, success: false };
  }

  const hasNewImage = foto instanceof File && foto.size > 0;

  if (foto !== null && !(foto instanceof File)) {
    return { error: "Arquivo de imagem inválido.", success: false };
  }

  if (hasNewImage && !ALLOWED_IMAGE_TYPES.includes(foto.type)) {
    return {
      error: "Escolha uma imagem nos formatos JPG, PNG ou WebP.",
      success: false,
    };
  }

  if (hasNewImage && foto.size > MAX_IMAGE_SIZE) {
    return {
      error: "A imagem deve ter no máximo 5 MB.",
      success: false,
    };
  }

  if (!hasNewImage) {
    try {
      await db.colaborador.update({
        where: { id },
        data: {
          nome: nome.trim(),
          nomeNormalizado,
        },
      });
    } catch (error) {
      if (isDuplicateNameError(error)) {
        return { error: DUPLICATE_NAME_ERROR, success: false };
      }

      console.error("Falha ao atualizar o funcionário:", error);
      return {
        error: "Não foi possível atualizar o funcionário. Tente novamente.",
        success: false,
      };
    }

    revalidatePath("/admin/funcionarios");
    return { error: null, success: true };
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

  const oldPublicId = funcionario.fotoUrl
    ? getCloudinaryPublicId(funcionario.fotoUrl, cloudName)
    : null;

  if (funcionario.fotoUrl && !oldPublicId) {
    return {
      error: "Não foi possível identificar a imagem atual no Cloudinary.",
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
    uploadedImage = await uploadImage(foto);
  } catch (error) {
    console.error("Falha ao enviar a nova imagem do funcionário:", error);
    return {
      error: "Não foi possível enviar a imagem. Tente novamente.",
      success: false,
    };
  }

  try {
    await db.colaborador.update({
      where: { id },
      data: {
        nome: nome.trim(),
        nomeNormalizado,
        fotoUrl: uploadedImage.secure_url,
      },
    });
  } catch (error) {
    try {
      await removeUploadedImage(uploadedImage.public_id);
    } catch (cleanupError) {
      console.error("Falha ao remover imagem órfã do Cloudinary:", cleanupError);
    }

    if (isDuplicateNameError(error)) {
      return { error: DUPLICATE_NAME_ERROR, success: false };
    }

    console.error("Falha ao salvar o funcionário:", error);
    return {
      error: "Não foi possível salvar as alterações. Tente novamente.",
      success: false,
    };
  }

  if (oldPublicId) {
    try {
      const result = await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: "image",
      });

      if (result.result !== "ok" && result.result !== "not found") {
        throw new Error(`Cloudinary retornou: ${result.result}`);
      }
    } catch (error) {
      console.error("Falha ao remover a imagem antiga do Cloudinary:", error);

      let rollbackSucceeded = false;

      try {
        await db.colaborador.update({
          where: { id },
          data: {
            nome: funcionario.nome,
            nomeNormalizado: funcionario.nomeNormalizado,
            fotoUrl: funcionario.fotoUrl,
          },
        });
        rollbackSucceeded = true;
      } catch (rollbackError) {
        console.error(
          "Falha ao restaurar os dados do funcionário após erro no Cloudinary:",
          rollbackError,
        );
      }

      try {
        await removeUploadedImage(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error(
          "Falha ao remover a nova imagem após erro no Cloudinary:",
          cleanupError,
        );
      }

      return {
        error: rollbackSucceeded
          ? "Não foi possível remover a imagem antiga. As alterações foram revertidas; tente novamente."
          : "Não foi possível remover a imagem antiga nem restaurar os dados anteriores. Entre em contato com o suporte.",
        success: false,
      };
    }
  }

  revalidatePath("/admin/funcionarios");
  return { error: null, success: true };
}