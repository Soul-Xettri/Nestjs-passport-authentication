import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { SignInDto, SignUpDto, UpdateDto } from './dto';
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

  @Get('me')
  getMe(@GetCurrentUserId() userId: string) {
    return this.authService.getMe(userId);
  }

  @Patch('update')
  updateProfile(@Body() dto: UpdateDto, @GetCurrentUserId() userId: string) {
    return this.authService.updateProfile(userId, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  signOut(@GetCurrentUserId() userId: string) {
    return this.authService.signOut(userId);
  }
}
