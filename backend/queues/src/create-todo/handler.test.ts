import { generateValidatedSQSEvent, executeLambdaSQS } from '@tests/mocks';
/**
 * @group unit
 */
import { InitUnitTestsMocks, initUnitTests, initUnitTestsMocks } from '@tests/helper';
import { main } from './handler';

describe('createTodo unit', () => {
  let initSpies: InitUnitTestsMocks;
  let insertManyBouncedSpy: jest.SpyInstance;
  let getDuplicatesAndNoneDuplicatesSpy: jest.SpyInstance;
  let duplicatesSpy: jest.SpyInstance;

  beforeAll(() => {
    initUnitTests();
  });

  beforeEach(() => {
    initSpies = initUnitTestsMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should pass', async () => {
    // Given
    // TODO: fix tests
    const message1 = new Fake().mailgunEvent({ eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE } });
    const message2 = new Fake().mailgunEvent({
      eventData: { event: MailgunEventEnum.PERMANENT_OR_TEMPORARY_FAILURE, recipient: TEST_EMAIL_2 },
    });
    const records = [Fake.sqsRecord(message1), Fake.sqsRecord(message2)];
    getDuplicatesAndNoneDuplicatesSpy = mockGetDuplicatesAndNoneDuplicates(records, { noneDuplicates: [message1, message2] });

    // When
    const event = generateValidatedSQSEvent({ records });
    await executeLambdaSQS(main, event);

    // Then
    expect(getDuplicatesAndNoneDuplicatesSpy).toHaveBeenCalled();
    expect(insertManyBouncedSpy).toHaveBeenCalled();
    expect(duplicatesSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy).toHaveBeenCalled();
    expect(initSpies.sendFailedEventsToDLQSpy.mock.calls[0][0]).toEqual([]);
  });
});
