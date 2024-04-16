import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { User, userSelectAllowedProperties } from './entities/user.entity';
import { SignUpDTO } from '../auth/dto/sign-up.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create({ username, password, isAdmin }: SignUpDTO): Promise<User> {
    // Ensure the password is only hashed once before saving
    const hashedPassword = await argon2.hash(password);

    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword, // Make sure this is the only place where hashing happens
      isAdmin,
    });

    // Save the new user to the database
    await this.usersRepository.save(newUser);
    return newUser;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: userSelectAllowedProperties,
    });
  }

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
