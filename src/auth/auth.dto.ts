import { IsString, IsNotEmpty, MinLength, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { UserRole } from './user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;
}

export class UpdateRoleDto {
  @IsEnum(UserRole, { message: 'Rôle invalide. Valeurs: client, artisan, admin' })
  role: UserRole;
}
