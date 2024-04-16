import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DenomsService } from './denoms.service';
import { CreateDenomDto } from './dto/create-denom.dto';
import { Admin } from '../common/decorators/is-admin.decorator';

@Admin()
@Controller('denoms')
export class DenomsController {
  constructor(private readonly denomsService: DenomsService) {}

  @Post()
  create(@Body() createDenomDto: CreateDenomDto) {
    return this.denomsService.create(createDenomDto);
  }

  @Get()
  findAll() {
    return this.denomsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.denomsService.remove(+id);
  }
}
