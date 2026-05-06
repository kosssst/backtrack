import {
	TAG_REQUEST_MAX_BYTES,
	TAG_TEXT_MAX_LENGTH,
} from '@/features/tags/constants';
import { Tags } from '@/features/tags/server/tag.model';
import type { TagContent, TagPayloadResult } from '@/features/tags/types';
import { connectMongoose } from '@/shared/database/mongoose';
import { isValidMongoObjectId } from '@/shared/database/object-id';
import { decrypt, encrypt } from '@/shared/security/encryption/aes-256-gcm';
import { readJsonWithLimit } from '@/shared/utils/json';

export async function createTagForAuthor(
	authorId: string,
	payload: TagContent,
) {
	const encryptedFields = await encryptText(payload.text, authorId);

	await connectMongoose();

	const tag = await Tags.create({
		...encryptedFields,
		color: payload.color,
		authorId: authorId,
	});

	return tag._id;
}

async function encryptText(text: string, authorId: string) {
	const textEnc = await encrypt(text, authorId);

	return {
		textEnc: { v: 1, ...textEnc },
	};
}

export async function readTagPayload(
	request: Request,
): Promise<TagPayloadResult> {
	try {
		const data = await readJsonWithLimit<unknown>(
			request,
			TAG_REQUEST_MAX_BYTES,
		);
		return normalizeTagPayload(data);
	} catch (error) {
		return {
			ok: false,
			message: 'Invalid JSON',
			cause: error,
		};
	}
}

function normalizeTagPayload(data: unknown): TagPayloadResult {
	const source = data as Partial<Record<keyof TagContent, unknown>> | null;
	const text = (source?.text ?? '').toString().trim();
	const color = (source?.color ?? '').toString().trim();

	if (!text) {
		return { ok: false, message: 'Invalid text' };
	}

	if (text.length > TAG_TEXT_MAX_LENGTH) {
		return { ok: false, message: 'Invalid text' };
	}

	if (!color) {
		return { ok: false, message: 'Invalid color' };
	}

	if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
		return { ok: false, message: 'Invalid color' };
	}

	return {
		ok: true,
		value: { text, color },
	};
}

export async function getTagsForAuthor(authorId: string) {
	await connectMongoose();

	const encryptedTags = await Tags.find({ authorId });

	return await Promise.all(
		encryptedTags.map(async (doc) => {
			const { textEnc, ...rest } = doc.toObject();

			const [text] = await Promise.all([decrypt(textEnc, authorId)]);

			return { ...rest, text };
		}),
	);
}

export async function updateTagForAuthor(
	tagId: string,
	authorId: string,
	payload: TagContent,
) {
	if (!isValidMongoObjectId(tagId)) {
		return false;
	}

	const encryptedFields = await encryptText(payload.text, authorId);

	await connectMongoose();

	const result = await Tags.updateOne(
		{ _id: tagId, authorId },
		{ ...encryptedFields, color: payload.color },
	);

	return result.matchedCount > 0 || result.modifiedCount > 0;
}

export async function deleteTagForAuthor(tagId: string, authorId: string) {
	if (!isValidMongoObjectId(tagId)) {
		return false;
	}

	await connectMongoose();

	const result = await Tags.deleteOne({ _id: tagId, authorId });

	return result.deletedCount > 0;
}
