import { logger } from '@libs/utils/logger';
import { Mailgun } from '@models/mailgun/mailgun.model';
import { SQS } from 'aws-sdk';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { Routes } from '../src/routes';

dotenv.config();

export const sqs = new SQS({ region: 'eu-west-3' });
export const AWS_ACCOUNT_ID = '696219976819';

export class E2e {
  baseUrl: string;

  constructor() {
    this.baseUrl = `https://${process.env.AWS_API_GATEWAY_ROUTE_ID}.execute-api.eu-west-3.amazonaws.com/${process.env.AWS_STAGE}`;
  }

  async sendMessageToApiGateway(message: Mailgun | any): Promise<void> {
    await axios.post(this.baseUrl + Routes.SEND_EVENT, JSON.stringify(message), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async wait({ seconds = 1 }: { seconds: number }): Promise<void> {
    new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  async getMessagesFromQueue(queueName: string): Promise<any[]> {
    const queueUrl = `https://sqs.eu-west-3.amazonaws.com/${AWS_ACCOUNT_ID}/${queueName}`;
    const response = await sqs.receiveMessage({ QueueUrl: queueUrl, WaitTimeSeconds: 20 }).promise();
    return response?.Messages?.map((message) => this.extractMessageFromReceiveMessageQuery(message)) ?? [];
  }

  async sendMessagesToQueue(queueName: string, message: object): Promise<void> {
    const queueUrl = `https://sqs.eu-west-3.amazonaws.com/${AWS_ACCOUNT_ID}/${queueName}`;
    const params: SQS.SendMessageRequest = {
      QueueUrl: queueUrl,
      MessageBody: this.formatSQSMessage(message),
    };
    const response = await sqs.sendMessage(params).promise();
    logger.info({ response });
  }

  async deleteAllMessagesFromQueue(queueName: string): Promise<void> {
    const queueUrl = `https://sqs.eu-west-3.amazonaws.com/${AWS_ACCOUNT_ID}/${queueName}`;
    await sqs.purgeQueue({ QueueUrl: queueUrl }).promise();
  }

  private extractMessageFromReceiveMessageQuery(message: SQS.Message): any {
    if (message?.Body) {
      const body = JSON.parse(message?.Body);
      return JSON.parse(body.Message);
    }
    return undefined;
  }

  private formatSQSMessage<T>(message: T): string {
    const foramtedMessage = {
      Message: JSON.stringify(message),
    };
    return JSON.stringify(foramtedMessage);
  }
}
