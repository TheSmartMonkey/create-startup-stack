/**
 * @group unit
 */
import { describe, expect, test } from '@jest/globals';
import { MailEventsDb } from '@libs/db/mail-events/mail-events.db';
import { Fake, TEST_EMAIL } from '@libs/tests/fake';
import { initUnitTests } from '@libs/tests/init-unit';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { MailEvent } from '@models/mongoose/mail-events.model';
import { MailingServices } from '@models/services.model';
import { MailgunTagsService } from './mailgun-tags';

describe('MailgunTagsService unit', () => {
  beforeAll(() => {
    initUnitTests();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should extract campaignId, batchId and step from mailun event', () => {
    // Given
    const mailgunEvent = new Fake().mailgunEvent({});

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(mailgunEvent['event-data'].tags);

    // Then
    expect(response).toEqual({ campaign_id: '62c45a8740ecb76ab4eee8b2', batch_id: '63cfeb6f32c7f36c06038899', step: 2 });
  });

  test('Should extract campaignId, batchId and step when tags are not in the same order', () => {
    // Given
    const tags = ['batch_63cfeb6f32c7f36c06038899_2', 'racine', '62c45a8740ecb76ab4eee8b2'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({ batch_id: '63cfeb6f32c7f36c06038899', step: 2, campaign_id: '62c45a8740ecb76ab4eee8b2' });
  });

  test('Should extract campaignId, batchId when there is no step in batch tag', () => {
    // Given
    const tags = ['batch_63cfeb6f32c7f36c06038899', '62c45a8740ecb76ab4eee8b2'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({ batch_id: '63cfeb6f32c7f36c06038899', campaign_id: '62c45a8740ecb76ab4eee8b2', step: 0 });
  });

  test('Should extract tag and set MailgunTags for metadata', () => {
    //Given
    const tags = ['type_recontact', 'innovation_6527e4ec148742a4398db419&campaign_6527e4ec148742a4398db41b&quiz_6527ea573319c20017d1c9a8'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({
      quiz_id: '6527ea573319c20017d1c9a8',
      type: 'recontact',
      innovation_id: '6527e4ec148742a4398db419',
      campaign_id: '6527e4ec148742a4398db41b',
    });
  });

  test('Should return empty when tags are not of the correct type', () => {
    // Given
    const tags = ['racine', '62c45a8740ecb76ab4eee8b2'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({ campaign_id: '62c45a8740ecb76ab4eee8b2' });
  });

  test('Should extract batchId and step from mailgun event when there is only batch', () => {
    // Given
    const tags = ['batch_63cfeb6f32c7f36c06038899_2', 'companyName'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({ batch_id: '63cfeb6f32c7f36c06038899', step: 2 });
  });

  test('Should extract no tags from mailgun event when tags is empty', () => {
    // Given
    const tags: string[] = [];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({});
  });

  test('Should extract no tags when there is more then 3 tags', () => {
    // Given
    const tags = ['racine', 'follow-up', 'notif_add_teammates', '*', 'mail-test'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({});
  });

  test('Should add notif to reason', () => {
    // Given
    const tags = ['notif_first_answer'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({ reason: 'notif_first_answer' });
  });

  test('Should throw an error when tag as _ and tag is unknown', () => {
    // Given
    const tags = ['fake_unknown_tag'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({});
  });

  test('Should add notif to reason even when mail test is passed', () => {
    // Given
    const mailgunEvent = new Fake().mailgunEvent({
      eventData: { tags: ['notif_add_teammates', 'mail-test'] },
    });

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(mailgunEvent['event-data'].tags);

    // Then
    expect(response).toEqual({ reason: 'notif_add_teammates' });
  });

  test('Should extract no tags from mailgun event when there is no reconised MailgunTags', () => {
    // Given
    const tags = ['follow-up', '*', 'mail-test'];

    // When
    const response = new MailgunTagsService().getAttributeValuesFromTags(tags);

    // Then
    expect(response).toEqual({});
  });

  test('Should set metadata with good fields in mailEvent from getAttributeValuesFromTags', () => {
    //Given
    const mailgunEvent = new Fake().mailgunEvent({
      signature: {},
      eventData: {
        event: MailgunEventEnum.DELIVERED_MESSAGE,
        tags: ['type_recontact', 'innovation_6527e4ec148742a4398db419&campaign_6527e4ec148742a4398db41b&quiz_6527ea573319c20017d1c9a8'],
      },
    });
    const expectedResponse: MailEvent = {
      event: MailgunEventEnum.DELIVERED_MESSAGE,
      service: MailingServices.MAILGUN,
      messageId: '20130503182626.18666.16540@sandboxf8804cecd4ad4dd599ec8f3f48d91c33.mailgun.org',
      recipient: TEST_EMAIL,
      metadata: {
        type: 'recontact',
        campaign_id: '6527e4ec148742a4398db41b',
        innovation_id: '6527e4ec148742a4398db419',
        quiz_id: '6527ea573319c20017d1c9a8',
      },
      innovation: '6527e4ec148742a4398db419',
      campaign: '6527e4ec148742a4398db41b',
    };

    //When
    const response = new MailEventsDb().mailgunEventToDao(mailgunEvent);

    //Then
    expect(response).toEqual(expectedResponse);
  });

  test('Should check tags length and return null if tags contains more than 3 values', () => {
    //Given
    const mailgunEvent = new Fake().mailgunEvent({
      signature: {},
      eventData: {
        tags: [
          'type_recontact',
          'innovation_6527e4ec148742a4398db419&campaign_6527e4ec148742a4398db41b&quiz_6527ea573319c20017d1c9a8',
          'racine',
          '',
        ],
      },
    });
    const expectedResponse = new MailEventsDb().mailgunEventToDao(mailgunEvent);

    //When
    const response = new MailEventsDb().mailgunEventToDao(mailgunEvent);

    //Then
    expect(response).toEqual(expectedResponse);
  });
});
