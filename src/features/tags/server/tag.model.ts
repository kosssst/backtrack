import mongoose, { InferSchemaType, Model, Schema } from 'mongoose';
import { EncFieldSchema } from '@/shared/database/encrypted-field.schema';

const TagSchema = new Schema(
	{
		textEnc: { type: EncFieldSchema, required: true },
		color: {
			type: String,
			required: true,
			validate: {
				validator: (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value),
				message: 'Color must be a valid hex color like #ffcc00',
			},
		},
		authorId: { type: String, required: true, index: true },
	},
	{ timestamps: true },
);

export type TagEntity = InferSchemaType<typeof TagSchema>;

export const Tags: Model<TagEntity> =
	(mongoose.models.Tags as Model<TagEntity>) ||
	mongoose.model<TagEntity>('Tags', TagSchema);
