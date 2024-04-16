import { Controller, Get, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { Admin } from '../common/decorators/is-admin.decorator';

@Admin()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
