import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: SignUpDto): Promise<Tokens> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto): Promise<Tokens> {
    return this.authService.signIn(dto);
  }
}
