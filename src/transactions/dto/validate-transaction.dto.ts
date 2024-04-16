import { IsEnum } from 'class-validator';
import {
  ApprovedOrRejected,
  TransactionStatus,
} from '../entities/transaction.entity';

export class ValidateTransactionDto {
  @IsEnum(
    {
      APPROVED: TransactionStatus.APPROVED,
      REJECTED: TransactionStatus.REJECTED,
    },
    { message: 'Status must be either approved or rejected' },
  )
  status: ApprovedOrRejected;
}
