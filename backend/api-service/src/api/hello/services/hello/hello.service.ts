import { HelloDto } from '@api/hello/dtos/hello.dto';
import { logger } from '@helpers/logger';
import { Hello } from '@models/hello.model';

export async function helloService(helloDto: HelloDto): Promise<Hello> {
  logger.info({ message: helloDto.message }, 'hello message');
  return helloDto;
}
