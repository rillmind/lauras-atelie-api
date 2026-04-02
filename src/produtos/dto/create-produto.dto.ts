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
  imagemUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materiais?: string[];

  @IsOptional()
  @IsString()
  dimensoes?: string;
}
