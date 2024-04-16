import { Module } from '@nestjs/common';
import { DenomsService } from './denoms.service';
import { DenomsController } from './denoms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Denom } from './entities/denom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Denom])],
  controllers: [DenomsController],
  providers: [DenomsService],
})
export class DenomsModule {}
