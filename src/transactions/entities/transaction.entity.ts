import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Denom } from '../../denoms/entities/denom.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Define a type for approved and rejected statuses
export type ApprovedOrRejected =
  | TransactionStatus.APPROVED
  | TransactionStatus.REJECTED;

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  // User who made the transaction
  @ManyToOne(() => User, (user) => user.transactionsSent)
  sender: User;

  // Denotes the amount of the transaction
  @Column()
  amount: number;

  // User who will receive the transaction
  @ManyToOne(() => User, (user) => user.transactionsReceived)
  receiver: User;

  // Denomination of the transaction
  @ManyToOne(() => Denom)
  denom: Denom;

  // Status of the transaction
  @Column({ default: TransactionStatus.PENDING })
  status: TransactionStatus;

  // Admin who reviewed the transaction
  @ManyToOne(() => User, { nullable: true })
  reviewedBy: User;
}
