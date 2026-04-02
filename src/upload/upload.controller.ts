import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { supabase } from "../lib/supabase";

@Controller("upload")
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    })
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log("Upload recebido:", {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? "presente" : "ausente",
    });

    if (!file) {
      throw new BadRequestException("Nenhum arquivo enviado");
    }

    if (!file.buffer) {
      throw new BadRequestException("Buffer do arquivo não disponível");
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`;

    try {
      const { data, error } = await supabase.storage
        .from("product-icons")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("Erro no upload Supabase:", error);
        throw new BadRequestException(`Erro no upload: ${error.message}`);
      }

      console.log("Upload realizado com sucesso:", data);

      // Usar o path completo retornado pelo upload
      const filePath = data?.fullPath || data?.path || fileName;
      console.log("Path do arquivo:", filePath);

      const { data: urlData, error: urlError } = await supabase.storage
        .from("product-icons")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      if (urlError) {
        console.error("Erro ao gerar URL assinada:", urlError);
        throw new BadRequestException(`Erro ao gerar URL: ${urlError.message}`);
      }

      console.log("URL assinada gerada:", urlData.signedUrl);
      return { imagemUrl: urlData.signedUrl };
    } catch (error: any) {
      console.error("Erro no upload:", error.message);
      throw error;
    }
  }
}
