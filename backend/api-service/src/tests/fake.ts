import { HelloDto } from '@api/hello/dtos/hello.dto';
import { randomUUID } from 'crypto';

export function fakeHelloDto(partial?: Partial<HelloDto>): HelloDto {
  return {
    message: 'fakeMessage',
    ...partial,
  };
}

export function fakeUser(partial?: Partial<any>): any {
  return {
    _id: randomUUID(),
    email: 'fake@gmail.com',
    ...partial,
  };
}
