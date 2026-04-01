import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from "class-validator";

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNumber()
  preco: number;

  @IsOptional()
  @IsEnum(["pronta", "encomenda"])
  categoria?: string;

  @IsOptional()
  @IsString()
  imagem?: string;

  @IsOptional()
  @IsArray()
  materiais?: string[];

  @IsOptional()
  @IsString()
  dimensoes?: string;
}
