import { HelloDto } from '@api/hello/dtos/hello.dto';
import { logger } from '@libs/logger';
import { Hello } from '@models/hello.model';

export async function helloService({ data }: { data: HelloDto }): Promise<Hello> {
  logger.info({ message: data.message }, 'hello message');
  return data;
}
