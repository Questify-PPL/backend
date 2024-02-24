import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, RegisterDTO, SSOAuthDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async login(loginDTO: LoginDTO) {
    return loginDTO;
  }

  async register(registerDTO: RegisterDTO) {
    return registerDTO;
  }

  async loginSSO(ssoDTO: SSOAuthDTO) {
    return ssoDTO;
  }
}
