import { IsString, IsOptional, IsBoolean, IsEmail } from "class-validator";

export class CreateUsuarioDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  telefone: string;

  @IsOptional()
  @IsString()
  senha?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
