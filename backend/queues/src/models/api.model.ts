import BlacklistSchema, { Blacklist } from '@models/mongoose/blacklist.model';
import BouncedSchema, { Bounced } from '@models/mongoose/bounced.model';
import MailEventSchema, { MailEvent } from '@models/mongoose/mail-events.model';
import WebhookDuplicatesSchema, { WebhookDuplicates } from '@models/mongoose/webhook-duplicates.model';
import MailServiceSchema, { MailService } from '@models/mongoose/mail-services.model';
import mongoose from 'mongoose';

export const MODELS = {
  Blacklist: mongoose.model<Blacklist>('Blacklist', BlacklistSchema),
  Bounced: mongoose.model<Bounced>('Bounced', BouncedSchema),
  MailEvent: mongoose.model<MailEvent>('MailEvent', MailEventSchema),
  WebhookDuplicates: mongoose.model<WebhookDuplicates>('WebhookDuplicates', WebhookDuplicatesSchema),
  MailService: mongoose.model<MailService>('MailService', MailServiceSchema),
};
