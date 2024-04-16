import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { UsersModule } from '../users/users.module';
import { BalancesModule } from '../balances/balances.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Transaction]),
    BalancesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
