import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { SignInDto, UpdateDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashRt: hash,
      },
    });
  }

  async signToken(userId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        { expiresIn: 60 * 15 * 60, secret: 'at-secret' },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        { expiresIn: 60 * 60 * 24 * 7, secret: 'rt-secret' },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async signUp(dto: SignUpDto): Promise<Tokens> {
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (findUser) {
        throw new Error('User with the same email already exists');
      }
      if (dto.password !== dto.confirmPassword) {
        throw new Error('Password and confirm password do not match');
      }
      const hash = await this.hashData(dto.password);
      const newUser = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
        },
      });
      const tokens = await this.signToken(newUser.id, newUser.email);
      await this.updateRtHash(newUser.id, tokens.refresh_token);
      return tokens;
    } catch (e: any) {
      throw new ForbiddenException(e.message);
    }
  }

  async signIn(dto: SignInDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new ForbiddenException('Invalid password');
    const tokens = await this.signToken(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async getMe(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        posts: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: dto.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async signOut(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashRt: {
          not: null,
        },
      },
      data: {
        hashRt: null,
      },
    });
    return 'Logged out';
  }

  async refresh(userId: string, rt: string) {
    console.log('userId, rt: ', userId, rt);
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    console.log('user: ', user);
    if (!user || !user.hashRt) throw new ForbiddenException('Access denied');

    const rtMatches = await bcrypt.compare(rt, user.hashRt);
    console.log('rtMatches: ', rtMatches);
    if (!rtMatches) throw new ForbiddenException('Access denied');

    const tokens = await this.signToken(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }
}
