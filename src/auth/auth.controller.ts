import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { Request as Req } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/is-public.decorator';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { SignUpDTO } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDTO) {
    return this.authService.signUp(
      signUpDto.username,
      signUpDto.password,
      signUpDto.isAdmin,
    );
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Req) {
    return this.authService.login(req.user);
  }
}
