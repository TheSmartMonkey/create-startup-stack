import { getAnyByStageType } from '@helpers/helper';
import { getCurrentFolderPath } from '@queues/handler-resolver';

export default {
  handler: `${getCurrentFolderPath(__dirname)}/handler.main`,
  timeout: 10,
  memorySize: 512,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['${self:custom.helloQueue}', 'Arn'],
        },
        batchSize: 10,
        maximumBatchingWindow: getAnyByStageType({ prod: 60, dev: 10 }),
      },
    },
  ],
};
