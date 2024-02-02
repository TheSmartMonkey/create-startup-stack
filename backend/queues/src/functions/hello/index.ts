import { getCurrentFolderPath } from '@libs/utils/handler-resolver';
import { Utils } from '@libs/utils/utils';
import { VPC_SECURITY_GROUP_IDS, VPC_SUBNET_IDS } from '@models/services.model';

export default {
  handler: `${getCurrentFolderPath(__dirname)}/handler.main`,
  timeout: 10,
  memorySize: 512,
  reservedConcurrency: 5,
  vpc: {
    securityGroupIds: Utils.getAnyByStageType({ dev: [], prod: VPC_SECURITY_GROUP_IDS }),
    subnetIds: Utils.getAnyByStageType({ dev: [], prod: VPC_SUBNET_IDS }),
  },
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['${self:custom.addToBlacklistQueue}', 'Arn'],
        },
        batchSize: 10,
        maximumBatchingWindow: Utils.getAnyByStageType({ prod: 60, dev: 10 }),
      },
    },
  ],
};
