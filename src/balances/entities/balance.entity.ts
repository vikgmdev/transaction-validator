import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Denom } from '../../denoms/entities/denom.entity';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.balances)
  user: User;

  @ManyToOne(() => Denom, { eager: true }) // Always load Denom with Balance
  denom: Denom;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;
}
