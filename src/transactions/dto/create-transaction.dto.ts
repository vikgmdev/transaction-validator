import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // ID of the denomination for the transaction
  @IsNumber()
  @IsNotEmpty()
  denomId: number;

  // User id of the receiver
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
}
