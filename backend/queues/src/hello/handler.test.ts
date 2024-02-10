/**
 * @group unit
 */
import { QueueServiceQueueEvent } from '@models/queues/queue-service-events';
import { fakeSqsEvent, fakeSqsRecord } from '@tests/fake';
import { fakeHelloDto } from '@tests/fake-dto';
import { InitUnitTestsMocks, initUnitTests, initUnitTestsMocks } from '@tests/helper';
import { executeLambdaSQS, generateValidatedSQSEvent } from '@tests/mocks';
import { main } from './handler';

describe('hello unit', () => {
  let initSpies: InitUnitTestsMocks;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsMocks();
  });
  

  test('Should return a message', async () => {
    // Given
    const message = 'simple message !';
    const helloEvent = fakeSqsEvent(fakeHelloDto({ message }), QueueServiceQueueEvent.HELLO_EVENT);
    const records = [fakeSqsRecord(helloEvent)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toHaveLength(0);
  });

  test('Should return a empty message', async () => {
    // Given
    const message = '';
    const helloEvent = fakeSqsEvent(fakeHelloDto({ message }), QueueServiceQueueEvent.HELLO_EVENT);
    const records = [fakeSqsRecord(helloEvent)];

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toHaveLength(0);
  });
});
