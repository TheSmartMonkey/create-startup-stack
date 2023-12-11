import { IsNotEmpty, IsString } from 'class-validator';

export class HelloDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
