import { randomUUID } from 'crypto';

export function fakeUserDao(partial?: Partial<any>): any {
  return {
    _id: randomUUID(),
    email: 'fake@gmail.com',
    ...partial,
  };
}
