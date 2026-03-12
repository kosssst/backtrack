import { Schema } from 'mongoose';
import { Binary } from 'bson';
import { BsonBinaryLike } from '@/types/encryption.types';

function isBsonBinaryLike(v: unknown): v is BsonBinaryLike {
	if (typeof v !== 'object' || v === null) return false;

	const o = v as Record<string, unknown>;
	return o._bsontype === 'Binary' && typeof o.value === 'function';
}

function binaryToBuffer(v: unknown): unknown {
	if (v == null) return v;
	if (Buffer.isBuffer(v)) return v;

	if (v instanceof Binary) {
		return Buffer.from(v.buffer.subarray(0, v.length()));
	}

	if (isBsonBinaryLike(v)) {
		return Buffer.from(v.value(true));
	}

	return v;
}

export const EncFieldSchema = new Schema(
	{
		v: { type: Number, required: true },
		alg: { type: String, required: true },

		iv: { type: Buffer, required: true, get: binaryToBuffer },
		ct: { type: Buffer, required: true, get: binaryToBuffer },
		tag: { type: Buffer, required: true, get: binaryToBuffer },
	},
	{
		_id: false,
		toObject: { getters: true },
		toJSON: { getters: true },
	},
);
