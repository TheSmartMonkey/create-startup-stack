/**
 * @group integration
 */
import * as sqs from '@queues/sqs';
import { initIntegrationTests } from '@tests/helper';

describe('hello integration', () => {
  let sendFailedEventsToDLQSpy: jest.SpyInstance;

  beforeAll(() => {
    initIntegrationTests();
  });

  beforeEach(async () => {
    sendFailedEventsToDLQSpy = jest.spyOn(sqs, 'sendFailedEventsToDLQ').mockImplementation(() => Promise.resolve());
  });

  test('Should return true', async () => {
    // Given
    // When
    // Then
    expect(sendFailedEventsToDLQSpy).not.toHaveBeenCalled();
    expect(true).toEqual(true);
  });
});
