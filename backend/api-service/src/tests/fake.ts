import { HelloDto } from '@api/hello/dtos/hello.dto';

export function fakeHelloDto(partial?: Partial<HelloDto>): HelloDto {
  return {
    message: 'fakeMessage',
    ...partial,
  };
}
