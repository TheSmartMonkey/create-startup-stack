import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserDao {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  exp: number;

  @IsNotEmpty()
  @IsNumber()
  iat: number;
}
