import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, SSOAuthDTO } from 'src/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }

  @Post('/login-sso')
  async loginSSO(@Body() ssoDTO: SSOAuthDTO) {
    return this.authService.loginSSO(ssoDTO);
  }
}
