import { DB_COLLECTIONS } from '@models/db.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { Schema } from 'mongoose';

export type WebhookDuplicates = {
  sqsMessageId: string;
  event: MailgunEventEnum;
  email: string;
  mailgunMessageId: string;
  source: string;
  countRetries: number;
  created?: Date;
};

const WebhookDuplicatesSchema = new Schema<WebhookDuplicates>(
  {
    sqsMessageId: { type: String, required: true, unique: true },
    event: { enum: Object.values(MailgunEventEnum), type: String, required: true },
    email: { type: String, required: true },
    mailgunMessageId: { type: String, default: 'unknown' },
    source: { type: String, default: 'unknown' },
    countRetries: { type: Number, default: 1 },
    created: { type: Date, default: Date.now, index: { expires: '7d' } },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: 'updated',
    },
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: DB_COLLECTIONS.WebhookDuplicates,
  },
);

WebhookDuplicatesSchema.index({ sqsMessageId: 1 }, { unique: true });
WebhookDuplicatesSchema.index({ email: 1 });
WebhookDuplicatesSchema.index({ email: 1, event: 1 });
WebhookDuplicatesSchema.index({ countRetries: 1 });

export default WebhookDuplicatesSchema;
