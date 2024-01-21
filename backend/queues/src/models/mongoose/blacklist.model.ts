import { DB_COLLECTIONS } from '@models/db.model';
import { Schema } from 'mongoose';

export enum BlacklistType {
  EMAIL = 'EMAIL',
  GLOBAL = 'GLOBAL',
}

export enum BlacklistReason {
  MANUALLY_ADDED = 'MANUALLY_ADDED',
  USER_SUPPRESSION = 'USER_SUPPRESSION',
  PROFESSIONAL_SUPPRESSION = 'PROFESSIONAL_SUPPRESSION',
  MAIL_EVENT = 'MAIL_EVENT',
}

export type Blacklist = {
  email: string;
  altEmail: string;
  domain?: string;
  expiration?: Date;
  type?: BlacklistType;
  reason?: BlacklistReason;
  umiDomain?: string;
};

const BlackListSchema = new Schema<Blacklist>(
  {
    email: { type: String, required: true, unique: true },
    altEmail: { type: String, required: true, unique: true },
    domain: { type: String, default: '' },
    expiration: { type: Date, default: 0 },
    type: { type: String, enum: Object.values(BlacklistType), default: BlacklistType.EMAIL },
    reason: { type: String, enum: Object.values(BlacklistReason), default: BlacklistReason.MANUALLY_ADDED },
    umiDomain: { type: String, default: 'umi.us' },
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: DB_COLLECTIONS.BlackList,
  },
);

/**
 * Indexes definition
 */
BlackListSchema.index({ created: -1 });
BlackListSchema.index({ email: 1 }, { unique: true });
BlackListSchema.index({ altEmail: 1 }, { unique: true });
BlackListSchema.index({ domain: 1 });
BlackListSchema.index({ umiDomain: 1, email: 1 });
BlackListSchema.index({ umiDomain: 1, domain: 1 });
BlackListSchema.index({ umiDomain: 1, domain: 1, email: 1 });
BlackListSchema.index({ umiDomain: 1, '$**': 'text' });

BlackListSchema.pre('save', function (next) {
  if (this.domain) return next();
  if (this.email) {
    const split = this.email.split('@');
    if (split.length) {
      this.domain = split[1];
    }
  }
});

export default BlackListSchema;
