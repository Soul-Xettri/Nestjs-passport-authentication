import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserCheckGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const { user } = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse() as Response;
    const exists = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (!exists) {
      response.cookie('token', '');
      throw new UnauthorizedException('Token has expired');
    }
    return true;
  }
}
