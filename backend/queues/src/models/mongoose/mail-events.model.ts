import { DB_COLLECTIONS } from '@models/db.model';
import { MailgunEventEnum } from '@models/mailgun/mailgun-events.model';
import { MailgunTags } from '@models/mailgun/mailgun-tags.model';
import { MailingServices } from '@models/services.model';
import { Schema } from 'mongoose';

export type MailEvent = {
  event: MailgunEventEnum;
  service: MailingServices;
  messageId: string;
  recipient: string;
  metadata: MailEventMetaData;
  innovation?: string;
  campaign?: string;
  batch?: string;
  step?: number;
  severity?: string;
};

export type MailEventMetaData = MailgunTags & {
  url?: string;
  sendAt?: Date;
};

const MailEventSchema = new Schema<MailEvent>(
  {
    event: { enum: Object.values(MailgunEventEnum), type: String, required: true }, // Registers en external event like open, click, unsubscribe...
    service: { enum: Object.values(MailingServices), type: String, required: true },
    messageId: { type: String, required: true }, // The id of the message when it was sent...
    recipient: { type: String, required: true }, // The e-mail address originating the event
    metadata: {
      innovation_id: { type: String },
      campaign_id: { type: String },
      batch_id: { type: String },
      abTesting: { type: Boolean },
      variation: { type: String },
      quiz_id: { type: String },
      url: { type: String },
      type: { type: String },
      step: { type: Number },
      sendAt: { type: Date },
    },
    innovation: { type: String },
    campaign: { type: String }, // The id of the campaign from which the message was sent
    batch: { type: String }, // The id of the batch
    step: { type: Number },
    severity: { type: String },
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: DB_COLLECTIONS.MailEvent,
  },
);

/**
 * Indexes definition
 */
/*  I commented all the indexes' definition here. According to MongoDB, defining indexes in
    mongoose is a bad practice. The recommendation is to define and create the indexes by hand
    in mongosh or another client. This may help to optimize the index use and storage.
    Juan. 05/07/2023
 */
// TODO: Use a compound index on recipient, event and steps
/*MailEventSchema.index({ recipient: 1, event: 1 }, { unique: true });
MailEventSchema.index({ created: 1 });
MailEventSchema.index({ messageId: 1 });
MailEventSchema.index({ recipient: 1 });
MailEventSchema.index({ campaign: 1 });
MailEventSchema.index({ batch: 1 });
MailEventSchema.index({ event: 1, created: 1 });
MailEventSchema.index({ messageId: 1, event: 1, created: 1 });
MailEventSchema.index({ recipient: 1, event: 1, created: 1 });
MailEventSchema.index({ campaign: 1, event: 1 });
MailEventSchema.index({ event: 1, batch: 1 });*/

export default MailEventSchema;
