import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: configService.get('NODE_ENV') === 'development',
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JWTDTO) {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
