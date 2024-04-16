import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Admin } from '../common/decorators/is-admin.decorator';
import { User } from '../users/entities/user.entity';
import { UserReq } from '../common/decorators/user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ValidateTransactionDto } from './dto/validate-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async createTransaction(
    @UserReq() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(
      user,
      createTransactionDto,
    );
  }

  @Admin()
  @Post('validate/:transactionId')
  async validateTransaction(
    @UserReq() user: User,
    @Param('transactionId') transactionId: number,
    @Body() validateTransactionDto: ValidateTransactionDto,
  ) {
    return this.transactionsService.validateAndExecuteTransaction(
      transactionId,
      user,
      validateTransactionDto.status,
    );
  }

  @Admin()
  @Get()
  async getAllTransactions() {
    return this.transactionsService.getAllTransactions();
  }
}
