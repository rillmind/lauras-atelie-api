import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { supabase } from "../lib/supabase";

@Controller("imagem")
export class ImagemController {
  @Get(":filename")
  async getImage(@Param("filename") filename: string, @Res() res: Response) {
    try {
      const { data, error } = await supabase.storage
        .from("product-icons")
        .download(filename);

      if (error || !data) {
        return res.status(404).send("Image not found");
      }

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const contentType =
        filename.endsWith(".png")
          ? "image/png"
          : filename.endsWith(".jpg") || filename.endsWith(".jpeg")
          ? "image/jpeg"
          : filename.endsWith(".gif")
          ? "image/gif"
          : "image/jpeg";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(buffer);
    } catch (error) {
      console.error("Erro ao buscar imagem:", error);
      return res.status(500).send("Error loading image");
    }
  }
}