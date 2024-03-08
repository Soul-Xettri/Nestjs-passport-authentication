import { IsEmail, IsString } from 'class-validator';

export class BaseAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class SignInDto extends BaseAuthDto {}

export class SignUpDto extends BaseAuthDto {
  @IsString()
  name: string;

  @IsString()
  confirmPassword: string;
}