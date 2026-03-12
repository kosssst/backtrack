import 'server-only';

import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';
import { EncFieldSchema } from '@/models/encField.schema';

const PostSchema = new Schema(
	{
		titleEnc: { type: EncFieldSchema, required: true },

		bodyEnc: { type: EncFieldSchema, required: true },

		authorId: { type: String, required: true, index: true },
	},
	{ timestamps: true },
);

export type PostEntity = InferSchemaType<typeof PostSchema>;

export const Posts: Model<PostEntity> =
	(mongoose.models.Post as Model<PostEntity>) ||
	mongoose.model<PostEntity>('Post', PostSchema);
