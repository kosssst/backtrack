import 'server-only';

import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';
import { EncFieldSchema } from '@/shared/database/encrypted-field.schema';

// Post content is stored as encrypted fields; only ownership and sorting metadata stays plaintext.
const PostSchema = new Schema(
	{
		titleEnc: { type: EncFieldSchema, required: true },

		bodyEnc: { type: EncFieldSchema, required: true },

		authorId: { type: String, required: true, index: true },
	},
	{ timestamps: true },
);

/** Encrypted post document shape inferred from the Mongoose schema. */
export type PostEntity = InferSchemaType<typeof PostSchema>;

/** Mongoose model for encrypted post documents. */
export const Posts: Model<PostEntity> =
	(mongoose.models.Post as Model<PostEntity>) ||
	mongoose.model<PostEntity>('Post', PostSchema);
