import { DB_COLLECTIONS } from '@models/db.model';
import { Schema } from 'mongoose';

export type Bounced = {
  email: string;
  domain: string;
};

const BouncedSchema = new Schema<Bounced>(
  {
    email: { type: String, required: true, unique: true },
    domain: { type: String },
  },
  {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: DB_COLLECTIONS.Bounced,
  },
);

BouncedSchema.index({ created: -1 });
BouncedSchema.index({ created: -1, domain: 1 });
BouncedSchema.index({ email: 1 }, { unique: true });
BouncedSchema.index({ domain: 1 });

export default BouncedSchema;
