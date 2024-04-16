import { IsString, Length } from 'class-validator';

export class CreateDenomDto {
  @IsString()
  @Length(3, 5)
  ticker: string;
}
