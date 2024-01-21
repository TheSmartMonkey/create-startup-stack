import { mongoDbInstance } from '@libs/adapter/mongodb.adapter';
import { MODELS } from '@models/api.model';
import { DB_COLLECTIONS } from '@models/db.model';
import { Blacklist } from '@models/mongoose/blacklist.model';
import { Bounced } from '@models/mongoose/bounced.model';
import { MailEvent } from '@models/mongoose/mail-events.model';
import { WebhookDuplicates } from '@models/mongoose/webhook-duplicates.model';
import { Fake } from './fake';

export class Generate {
  async createWebhookDuplicate(partial?: Partial<WebhookDuplicates>): Promise<void> {
    const webhookDuplicate = new Fake().webhookDuplicate(partial);
    await MODELS.WebhookDuplicates.create(webhookDuplicate);
  }

  async createMailEvent(partial?: Partial<MailEvent>): Promise<void> {
    const mailEvent = new Fake().mailEvent(partial);
    await MODELS.MailEvent.create(mailEvent);
  }

  async createBlacklist(partial?: Partial<Blacklist>): Promise<void> {
    const blacklist = new Fake().blacklist(partial);
    await MODELS.Blacklist.create(blacklist);
  }

  async createBounced(partial?: Partial<Bounced>): Promise<void> {
    const bounced = new Fake().bounced(partial);
    await MODELS.Bounced.create(bounced);
  }

  async createPro(partial?: any): Promise<void> {
    const pro = new Fake().pro(partial);
    await mongoDbInstance.collection(DB_COLLECTIONS.Pros).insertOne(pro);
  }

  async deleteAllpros(): Promise<void> {
    await mongoDbInstance.collection(DB_COLLECTIONS.Pros).deleteMany({});
  }

  async updateProEmailConfidence(email: string, { emailConfidence }: { emailConfidence: 0 | 80 | 100 }): Promise<void> {
    await mongoDbInstance.collection(DB_COLLECTIONS.Pros).updateMany({ email }, { $set: { emailConfidence, updated: new Date() } });
  }

  async deleteAllNewsletterStats(): Promise<void> {
    await mongoDbInstance.collection(DB_COLLECTIONS.NewsletterStats).deleteMany({});
  }

  async deleteAllInnovations(): Promise<void> {
    await mongoDbInstance.collection(DB_COLLECTIONS.Innovation).deleteMany({});
  }

  async deleteAllMailServices(): Promise<void> {
    await mongoDbInstance.collection(DB_COLLECTIONS.MailService).deleteMany({});
  }
}
