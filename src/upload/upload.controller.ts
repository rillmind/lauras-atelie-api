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
      console.log("Full path:", data.fullPath);

      // Tentar criar URL assinada com o path correto
      const { data: urlData, error: urlError } = await supabase.storage
        .from("product-icons")
        .createSignedUrl(data.path, 60 * 60 * 24 * 365, {
          transform: {
            width: 800,
            height: 800,
            resize: "contain",
          },
        });

      if (urlError) {
        console.error("Erro ao gerar URL assinada:", urlError);
        // Fallback: usar URL pública se bucket for público
        const { data: publicUrl } = supabase.storage
          .from("product-icons")
          .getPublicUrl(data.path);
        
        if (publicUrl?.publicUrl) {
          console.log("Usando URL pública:", publicUrl.publicUrl);
          return { imagemUrl: publicUrl.publicUrl };
        }
        
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
