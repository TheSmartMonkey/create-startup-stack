import { log } from '@helpers/logger';
import { Hello } from '@models/hello.model';
import { HelloDto } from '@src/hello/dtos/hello.dto';

export async function helloService({ data }: { data: HelloDto }): Promise<Hello> {
  log.info({ message: data.message }, 'hello message');
  return data;
}
