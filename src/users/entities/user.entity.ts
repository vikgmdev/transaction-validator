import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  FindOptionsSelect,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Balance } from '../../balances/entities/balance.entity';

export const userSelectAllowedProperties: FindOptionsSelect<User> = {
  id: true,
  username: true,
};

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.sender, {
    eager: true,
  })
  transactionsSent: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.receiver, {
    eager: true,
  })
  transactionsReceived: Transaction[];

  @OneToMany(() => Balance, (balance) => balance.user, { eager: true })
  balances: Balance[];
}
