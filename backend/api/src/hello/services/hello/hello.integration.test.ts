/**
 * @group integration
 */
import { initIntegrationTests } from '@tests/helper';

describe('hello integration', () => {
  beforeAll(() => {
    initIntegrationTests();
  });

  test('Should return true', async () => {
    // Given
    // When
    // Then
    expect(true).toEqual(true);
  });
});
