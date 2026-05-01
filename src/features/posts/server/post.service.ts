import 'server-only';

import { connectMongoose } from '@/shared/database/mongoose';
import { Posts } from '@/features/posts/server/post.model';
import { decrypt, encrypt } from '@/shared/security/encryption/aes-256-gcm';
import { toIntParam } from '@/shared/utils/misc';
import { readJsonWithLimit } from '@/shared/utils/json';
import type { AES256GCMEncryptedData } from '@/shared/security/types';
import type { PostContent, PostPayloadResult } from '@/features/posts/types';
import {
	POST_BODY_MAX_LENGTH,
	POST_REQUEST_MAX_BYTES,
	POST_TITLE_MAX_LENGTH,
	POSTS_DEFAULT_PAGE,
	POSTS_DEFAULT_PAGE_LIMIT,
	POSTS_MAX_PAGE_LIMIT,
} from '@/features/posts/constants';

type AuthorPostsFilter = {
	authorId: string;
	createdAt?: { $gte: string; $lte: string };
};

function buildAuthorPostsFilter(
	authorId: string,
	from: string | null,
	to: string | null,
): AuthorPostsFilter {
	const filter: AuthorPostsFilter = { authorId };

	if (from && to) {
		filter.createdAt = { $gte: from, $lte: to };
	}

	return filter;
}

async function encryptPostFields(payload: PostContent, authorId: string) {
	const [titleEnc, bodyEnc] = await Promise.all([
		encrypt(payload.title, authorId),
		encrypt(payload.body, authorId),
	]);

	return {
		titleEnc: { v: 1, ...titleEnc },
		bodyEnc: { v: 1, ...bodyEnc },
	};
}

/**
 * Creates a post after encrypting user-owned content.
 *
 * Plaintext title/body values are never sent to MongoDB. The authenticated user
 * id is also used as encryption AAD, so encrypted fields cannot be moved between
 * users without failing decryption.
 */
export async function createPostForAuthor(
	authorId: string,
	payload: PostContent,
) {
	const encryptedFields = await encryptPostFields(payload, authorId);

	await connectMongoose();

	const post = await Posts.create({
		...encryptedFields,
		authorId,
	});

	return post._id;
}

/**
 * Updates a post owned by the authenticated user.
 *
 * Matching on both post id and author id prevents cross-user writes even if a
 * valid post id is guessed or leaked.
 */
export async function updatePostForAuthor(
	postId: string,
	authorId: string,
	payload: PostContent,
) {
	const encryptedFields = await encryptPostFields(payload, authorId);

	await connectMongoose();

	const result = await Posts.updateOne(
		{ _id: postId, authorId },
		encryptedFields,
	);

	return result.matchedCount > 0 || result.modifiedCount > 0;
}

/**
 * Deletes a post only when it belongs to the authenticated user.
 */
export async function deletePostForAuthor(postId: string, authorId: string) {
	await connectMongoose();

	const result = await Posts.deleteOne({
		_id: postId,
		authorId,
	});

	return result.deletedCount > 0;
}

/**
 * Returns one decrypted page of posts for an author.
 */
export async function listPostsForAuthor(input: {
	authorId: string;
	page: number;
	limit: number;
	from: string | null;
	to: string | null;
}) {
	const { authorId, page, limit, from, to } = input;
	const filter = buildAuthorPostsFilter(authorId, from, to);

	await connectMongoose();

	const total = await Posts.countDocuments(filter);
	const maxPage = Math.max(1, Math.ceil(total / limit));

	if (page > maxPage) {
		return { ok: false as const, message: 'invalid page' };
	}

	const skip = (page - 1) * limit;
	const encryptedPosts = await Posts.find(filter)
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	const posts = await Promise.all(
		encryptedPosts.map(async (doc) => {
			const { titleEnc, bodyEnc, ...rest } = doc.toObject();
			const [title, body] = await Promise.all([
				decrypt(titleEnc as AES256GCMEncryptedData, authorId),
				decrypt(bodyEnc as AES256GCMEncryptedData, authorId),
			]);

			return { ...rest, title, body };
		}),
	);

	return {
		ok: true as const,
		posts,
		page,
		maxPage,
		total,
		limit,
	};
}

/**
 * Parses list pagination query parameters and clamps them to API limits.
 */
export function parsePostsPagination(searchParams: URLSearchParams) {
	const limit = Math.min(
		Math.max(
			toIntParam(searchParams.get('limit'), POSTS_DEFAULT_PAGE_LIMIT),
			1,
		),
		POSTS_MAX_PAGE_LIMIT,
	);
	const page = Math.max(
		toIntParam(searchParams.get('page'), POSTS_DEFAULT_PAGE),
		POSTS_DEFAULT_PAGE,
	);

	return { page, limit };
}

function normalizePostPayload(data: unknown): PostPayloadResult {
	const source = data as Partial<Record<keyof PostContent, unknown>> | null;
	const title = (source?.title ?? '').toString().trim();
	const body = (source?.body ?? '').toString().trim();

	if (!title) {
		return { ok: false, message: 'Invalid title' };
	}

	if (title.length > POST_TITLE_MAX_LENGTH) {
		return { ok: false, message: 'Invalid title' };
	}

	if (!body) {
		return { ok: false, message: 'Invalid content' };
	}

	if (body.length > POST_BODY_MAX_LENGTH) {
		return { ok: false, message: 'Invalid content' };
	}

	return {
		ok: true,
		value: { title, body },
	};
}

/**
 * Reads and validates the request body used by create/update post endpoints.
 *
 * The result shape lets route handlers return client-safe messages while still
 * logging low-level JSON/body errors through the server logger.
 */
export async function readPostPayload(
	request: Request,
): Promise<PostPayloadResult> {
	try {
		const data = await readJsonWithLimit<unknown>(
			request,
			POST_REQUEST_MAX_BYTES,
		);
		return normalizePostPayload(data);
	} catch (error) {
		return {
			ok: false,
			message: 'Invalid JSON',
			cause: error,
		};
	}
}
