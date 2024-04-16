import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, Length } from 'class-validator';

@Entity()
export class Denom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @Length(3, 5) // Most crypto tickers are 3-5 characters long
  ticker: string;
}
