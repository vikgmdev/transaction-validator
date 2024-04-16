import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ApprovedOrRejected,
  Transaction,
  TransactionStatus,
} from './entities/transaction.entity';
import {
  User,
  userSelectAllowedProperties,
} from '../users/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Balance } from '../balances/entities/balance.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createTransaction(
    sender: User,
    { amount, receiverId, denomId }: CreateTransactionDto,
  ): Promise<Transaction> {
    // Find the receiver
    const receiver = await this.usersRepository.findOneBy({ id: receiverId });

    // If the receiver is not found, we should throw an error
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // If the sender and receiver are the same, we should throw an error
    const senderBalance = await this.balanceRepository.findOne({
      where: { user: sender, denom: { id: denomId } },
      relations: ['denom'],
    });

    // If the sender has insufficient funds, we should throw an error
    if (!senderBalance || senderBalance.amount < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Create the transaction and save it
    const transaction = this.transactionsRepository.create({
      sender,
      receiver,
      amount,
      denom: { id: denomId },
      status: TransactionStatus.PENDING,
    });
    return this.transactionsRepository.save(transaction);
  }

  async validateAndExecuteTransaction(
    transactionId: number,
    adminUser: User,
    status: ApprovedOrRejected,
  ): Promise<void> {
    // Create a new query runner to handle the transaction manually
    const queryRunner = this.dataSource.createQueryRunner();

    // Establish a database connection and start a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the transaction to be reviewed
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId },
        relations: ['sender', 'receiver', 'denom'],
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      // If the transaction is already reviewed, we should not allow it to be reviewed again
      if (
        transaction.reviewedBy ||
        transaction.status !== TransactionStatus.PENDING
      ) {
        throw new BadRequestException('Transaction already reviewed');
      }

      // Set the status and the admin who reviewed the transaction
      transaction.status = status;
      transaction.reviewedBy = adminUser;

      // If the transaction is approved, we should update the balances of the sender and receiver
      if (status === TransactionStatus.APPROVED) {
        // Find the balances of the sender
        const senderBalance = await queryRunner.manager.findOne(Balance, {
          where: { user: transaction.sender, denom: transaction.denom },
        });

        // Find the balances of the receiver or create a new one if it doesn't exist
        const receiverBalance =
          (await queryRunner.manager.findOne(Balance, {
            where: { user: transaction.receiver, denom: transaction.denom },
          })) ||
          queryRunner.manager.create(Balance, {
            user: transaction.receiver,
            denom: transaction.denom,
            amount: 0,
          });

        // Parse floats safely before performing arithmetic operations
        const transactionAmount = parseFloat(transaction.amount.toString());
        senderBalance.amount =
          parseFloat(senderBalance.amount.toString()) - transactionAmount;
        receiverBalance.amount =
          parseFloat(receiverBalance.amount.toString()) + transactionAmount;

        // If the sender has insufficient funds, we should not allow the transaction to be executed
        // Even we already checked the balance when creating the transaction this is safety check to prevent double spending
        if (senderBalance.amount < 0) {
          throw new HttpException(
            'Insufficient funds',
            HttpStatus.PRECONDITION_FAILED,
          );
        }

        // Save the updated balances
        await queryRunner.manager.save(senderBalance);
        await queryRunner.manager.save(receiverBalance);
      }

      // Save the transaction
      await queryRunner.manager.save(transaction);

      // commit the transaction
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors, let's rollback the changes we made
      await queryRunner.rollbackTransaction();
      throw err; // It's important to rethrow the error after rollback
    } finally {
      // you need to release queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['sender', 'receiver', 'denom'],
      select: {
        sender: userSelectAllowedProperties,
        receiver: userSelectAllowedProperties,
      },
    });
  }
}
