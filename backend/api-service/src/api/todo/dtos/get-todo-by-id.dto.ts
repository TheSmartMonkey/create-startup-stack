import { IsNotEmpty, IsString } from 'class-validator';

export class GetTodoByIdTodoDto {
  @IsNotEmpty()
  @IsString()
  todoId: string;
}
