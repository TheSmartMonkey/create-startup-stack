// TODO: Alarms don't works as expected
// export default {
//   DLQAlarm: {
//     DependsOn: ['${self:custom.mailingAlarmsTopic}'],
//     Type: 'AWS::CloudWatch::Alarm',
//     Properties: {
//       AlarmName: '${self:service}-dlq-alarm-${self:provider.stage}',
//       AlarmDescription: 'There are failed messages in one of ${self:provider.stage} DLQs',
//       Namespace: 'AWS/SQS',
//       MetricName: 'ApproximateNumberOfMessagesVisible',
//       Dimensions: [
//         {
//           Name: '${self:custom.mailingTopicRedirectionKeepOtherEventsQueueName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionKeepOtherEventsQueue}', 'Arn'] },
//         },
//         {
//           Name: '${self:custom.mailingTopicRedirectionKeepAllMessagesQueueName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionKeepAllMessagesQueue}', 'Arn'] },
//         },
//         {
//           Name: '${self:custom.mailingTopicRedirectionQueueDLQName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.mailingTopicRedirectionQueueDLQ}', 'Arn'] },
//         },
//         {
//           Name: '${self:custom.updateProsQueueDLQName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.updateProsQueueDLQ}', 'Arn'] },
//         },
//         {
//           Name: '${self:custom.addToMailEventsQueueDLQName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.addToMailEventsQueueDLQ}', 'Arn'] },
//         },
//         {
//           Name: '${self:custom.addToBouncedQueueDLQName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.addToBouncedQueueDLQ}', 'Arn'] },
//         },
//         {
//           Name: '${self:custom.addToBlacklistQueueDLQName}',
//           Value: { 'Fn::GetAtt': ['${self:custom.addToBlacklistQueueDLQ}', 'Arn'] },
//         },
//       ],
//       Statistic: 'Sum',
//       Period: 60,
//       EvaluationPeriods: 1,
//       Threshold: 0,
//       ComparisonOperator: 'GreaterThanThreshold',
//       // AlarmActions: [{ Ref: '${self:custom.mailingAlarmsTopic}' }],
//       // AlarmActions: Utils.getAnyByStageType({
//       //   prod: [{ Ref: 'DLQAlarmLaurentSubscription' }, { Ref: 'DLQAlarmMorganeSubscription' }],
//       //   dev: [],
//       // }),
//     },
//   },
// };
