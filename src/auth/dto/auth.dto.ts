import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BaseAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignInDto extends BaseAuthDto {}

export class SignUpDto extends BaseAuthDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

export class UpdateDto {
  @IsOptional()
  @IsString()
  name: string;
}
