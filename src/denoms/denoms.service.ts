import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Denom } from './entities/denom.entity';
import { CreateDenomDto } from './dto/create-denom.dto';

@Injectable()
export class DenomsService {
  constructor(
    @InjectRepository(Denom)
    private readonly denomRepository: Repository<Denom>,
  ) {}

  async create(createDenomDto: CreateDenomDto): Promise<Denom> {
    const denom = this.denomRepository.create(createDenomDto);
    return await this.denomRepository.save(denom);
  }

  async findAll(): Promise<Denom[]> {
    return await this.denomRepository.find();
  }

  async remove(id: number): Promise<void> {
    const result = await this.denomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Denom with ID ${id} not found`);
    }
  }
}
