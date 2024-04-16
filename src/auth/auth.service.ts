import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, inputPassword: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    const isPasswordValid = await argon2.verify(user.password, inputPassword);

    if (!user || !isPasswordValid) return null;

    // Using object destructuring to exclude the password before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUserDetails } = user;
    return safeUserDetails;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,

      // TODO: REMOVE THIS LINE IN PRODUCTION ENVIRONMENT (FOR TESTING PURPOSES ONLY)
      isAdmin: user.isAdmin,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(username: string, password: string, isAdmin: boolean) {
    const newUser = await this.usersService.create({
      username,
      password,
      isAdmin,
    });
    return this.login(newUser);
  }
}
