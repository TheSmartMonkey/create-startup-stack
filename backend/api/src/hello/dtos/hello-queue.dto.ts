import { IsNotEmpty, IsString } from 'class-validator';

export class HelloQueueDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
