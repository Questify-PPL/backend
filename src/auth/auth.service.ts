import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AxiosResponse } from 'axios';
import * as bcrypt from 'bcrypt';
import { XMLParser } from 'fast-xml-parser';
import { firstValueFrom } from 'rxjs';
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

  async register(registerDTO: RegisterDTO) {
    const { email, password } = registerDTO;

    if (await this.validateUIEmail(email)) {
      throw new BadRequestException('Please sign up with SSO instead');
    }

    const user = await this.findUserByEmail(email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.prismaService.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          email: registerDTO.email,
          password: hashedPassword,
          // ADD ROLE
        },
      });

      await prisma.creator.create({
        data: {
          user: {
            connect: {
              id: createdUser.id,
            },
          },
        },
      });

      // TODO: CALL EMAIL SERVICE

      return createdUser;
    });

    return {
      statusCode: 201,
      message: 'User created',
      data: {
        id: newUser.id,
        email: newUser.email,
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
    const { ticket, serviceURL } = ssoDTO;

    const { user, username, npm } = await this.getDataFromSSO(
      ticket,
      serviceURL,
    );

    let foundUser = await this.findUserById(`UI${npm}`);

    if (!foundUser) {
      foundUser = await this.createSSOAuthenticatedUser(user, username, npm);
    }

    const token = await this.signToken(foundUser.id);

    return {
      statusCode: 200,
      message: 'Success',
      data: {
        accessToken: token,
      },
    };
  }

  private async getDataFromSSO(ticket: string, serviceURL: string) {
    const url = `https://sso.ui.ac.id/cas2/serviceValidate?ticket=${ticket}&service=${serviceURL}`;

    const request = this.httpService.get(url);

    const response = await firstValueFrom(request);

    if (response.status !== 200) {
      throw new BadRequestException(
        'CAS Server failed to response, please try again later',
      );
    }

    const data = await this.parseSSOData(response);

    return {
      user: data['cas:user'],
      username: data['cas:attributes']['cas:nama'],
      kd_org: data['cas:attributes']['cas:kd_org'],
      peran_user: data['cas:attributes']['cas:peran_user'],
      npm: data['cas:attributes']['cas:npm'],
    };
  }

  private async parseSSOData(response: AxiosResponse<any, any>) {
    // Parse XML
    const data = response.data;

    const parser = new XMLParser({
      attributeNamePrefix: '',
    });

    const parsedData = parser.parse(data);

    if (!parsedData['cas:serviceResponse']) {
      throw new BadRequestException('Failed to parse XML');
    }

    if (parsedData['cas:serviceResponse']['cas:authenticationFailure']) {
      throw new BadRequestException(
        `Authentication failed - ${parsedData['cas:serviceResponse']['cas:authenticationFailure']}`,
      );
    }

    return parsedData['cas:serviceResponse']['cas:authenticationSuccess'];
  }

  private async findUserById(npm: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: npm,
      },
    });

    return user;
  }

  private async createSSOAuthenticatedUser(
    user: string,
    username: string,
    npm: string,
  ) {
    const newUser = await this.prismaService.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          id: `UI${npm}`,
          email: `${user}@ui.ac.id`,
          ssoUsername: username,
        },
      });

      await prisma.creator.create({
        data: {
          user: {
            connect: {
              id: createdUser.id,
            },
          },
        },
      });

      await prisma.respondent.create({
        data: {
          user: {
            connect: {
              id: createdUser.id,
            },
          },
        },
      });

      return createdUser;
    });

    return newUser;
  }
}
