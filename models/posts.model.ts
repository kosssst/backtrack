import 'server-only';

import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const PostSchema = new Schema(
	{
		title: { type: String, required: true, trim: true, maxlength: 200 },
		body: { type: String, required: true, trim: true, maxlength: 20_000 },

		authorId: { type: String, required: true, index: true },
	},
	{ timestamps: true },
);

export type PostEntity = InferSchemaType<typeof PostSchema>;

export const Posts: Model<PostEntity> =
	(mongoose.models.Post as Model<PostEntity>) ||
	mongoose.model<PostEntity>('Post', PostSchema);
