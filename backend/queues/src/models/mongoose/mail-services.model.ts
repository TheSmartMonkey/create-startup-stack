import { DB_COLLECTIONS } from '@models/db.model';
import { Schema } from 'mongoose';

export enum MailServiceStatus {
  ACCEPTED = 'accepted',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
  OPENED = 'opened',
  CLICKED = 'clicked',
  REJECTED = 'rejected',
  COMPLAINED = 'complained',
}

export type MailServiceEventType = {
  accepted: Array<any>;
  delivered: Array<any>;
  opened: Array<any>;
  clicked: Array<any>;
  bounced: Array<any>;
  dropped: Array<any>;
  unsubscribed: Array<any>;
  complained: Array<any>;
};

export type MailService = {
  from: string;
  to: string;
  messageId: string;
  carrier: string;
  status: MailServiceStatus;
  metadata?: any;
  campaign?: string;
  batch?: string;
  step?: number;
  tags?: Array<string>;
  domain?: string;
  response?: string;
  events: MailServiceEventType;
};

const MailServiceSchema = new Schema<MailService>(
  {
    from: {
      type: String,
      null: false,
    },

    to: {
      type: String,
      null: false,
    },

    domain: {
      type: String,
      default: '',
    },

    messageId: {
      type: String,
      null: false,
    },

    response: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: Object.values(MailServiceStatus),
    },

    carrier: {
      type: String,
      null: false,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    campaign: {
      type: String,
      default: '',
    },

    batch: {
      type: String,
      default: '',
    },

    step: {
      type: Number,
    },

    tags: [
      {
        type: String,
      },
    ],

    events: {
      accepted: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      delivered: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      opened: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      clicked: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      bounced: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      dropped: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      unsubscribed: {
        type: [Schema.Types.Mixed],
        default: [],
      },

      complained: {
        type: [Schema.Types.Mixed],
        default: [],
      },
    },
  },
  {
    timestamps: {
      createdAt: 'dateSent',
      updatedAt: 'updated',
    },
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: DB_COLLECTIONS.MailService,
  },
);

/**
 * Indexes definition
 */
MailServiceSchema.index({ dateSent: -1 });
MailServiceSchema.index({ messageId: 1 });
MailServiceSchema.index({ to: 1 });
MailServiceSchema.index({ domain: 1 });
MailServiceSchema.index({ batch: 1 });
MailServiceSchema.index({ campaign: 1, to: 1 });
MailServiceSchema.index({ messageId: 1, to: 1 });
MailServiceSchema.index({ tags: 1 });

export default MailServiceSchema;
