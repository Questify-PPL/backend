import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDTO, SSOAuthDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    if (await this.validateUIEmail(email)) {
      throw new BadRequestException('Please sign in with SSO instead');
    }

    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }

    const token = await this.signToken(user.id);

    return {
      statusCode: 200,
      message: 'Success',
      data: {
        accessToken: token,
      },
    };
  }

  private async validateUIEmail(email: string) {
    return email.endsWith('@ui.ac.id');
  }

  private async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  private async signToken(userId: string) {
    const payload = {
      userId,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret: 'TEST_SECRET_KEY',
    });

    return token;
  }

  async loginSSO(ssoDTO: SSOAuthDTO) {
    return ssoDTO;
  }
}
