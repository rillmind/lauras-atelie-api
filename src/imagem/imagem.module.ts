import { Module } from "@nestjs/common";
import { ImagemController } from "./imagem.controller";

@Module({
  controllers: [ImagemController],
})
export class ImagemModule {}