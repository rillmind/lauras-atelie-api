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

    try {
      const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`;
      console.log("Nome do arquivo:", fileName);

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
      console.log("Path retornado:", data.path);

      // Bucket é público, usar URL pública direta
      const { data: urlData } = supabase.storage
        .from("product-icons")
        .getPublicUrl(data.path);

      console.log("URL pública gerada:", urlData.publicUrl);
      return { imagemUrl: data.path };
    } catch (error: any) {
      console.error("Erro no upload:", error.message);
      throw error;
    }
  }
}
