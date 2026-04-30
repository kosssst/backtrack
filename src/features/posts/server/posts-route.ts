import { NextResponse } from 'next/server';
import { connectMongoose } from '@/shared/database/mongoose';
import { Posts } from '@/features/posts/server/post.model';
import { decrypt, encrypt } from '@/shared/security/encryption/aes-256-gcm';
import { AES256GCMEncryptedData } from '@/shared/security/types';
import {
	toISODateWithEndOfDay,
	toISODateWithStartOfDay,
} from '@/features/posts/utils/format-post-date';
import { requireApiSession } from '@/features/auth/server/require-api-session';
import { readJsonWithLimit } from '@/shared/utils/json';
import { logger } from '@/shared/logging/logger';
import { CreatePostRequestPayload } from '@/features/posts/types';

export const runtime = 'nodejs';

const MAX_POST_BYTES = 32 * 1024;

function toIntParam(value: string | null, fallback: number) {
	if (value == null || value.trim() === '') return fallback;

	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) ? n : fallback;
}

function buildAuthorPostsFilter(
	authorId: string,
	from: string | null,
	to: string | null,
) {
	const filter: {
		authorId: string;
		createdAt?: { $gte: string; $lte: string };
	} = { authorId };

	if (from && to) {
		filter.createdAt = { $gte: from, $lte: to };
	}

	return filter;
}

export async function POST(req: Request) {
	const { session, errorResponse } = await requireApiSession(req);
	if (!session) {
		return errorResponse;
	}

	let data: CreatePostRequestPayload;

	try {
		data = await readJsonWithLimit<CreatePostRequestPayload>(
			req,
			MAX_POST_BYTES,
		);
	} catch (error) {
		logger.error(error);
		return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
	}

	const title = (data?.title ?? '').toString().trim();
	const body = (data?.body ?? '').toString().trim();

	if (!title || title.length > 200) {
		return NextResponse.json({ message: 'Invalid title' }, { status: 400 });
	}
	if (!body || body.length > 20_000) {
		return NextResponse.json({ message: 'Invalid content' }, { status: 400 });
	}

	let post;

	try {
		// Encrypt user-owned content before persistence; MongoDB never receives plaintext titles or bodies.
		const titleEnc = await encrypt(title, session.user.id);
		const bodyEnc = await encrypt(body, session.user.id);

		await connectMongoose();

		post = await Posts.create({
			titleEnc: { v: 1, ...titleEnc },
			bodyEnc: { v: 1, ...bodyEnc },
			authorId: session.user.id,
		});
	} catch (error) {
		logger.error(error);
		return NextResponse.json(
			{ message: 'Unable to create a post' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: post._id }, { status: 201 });
}

export async function GET(req: Request) {
	const { session, errorResponse } = await requireApiSession(req);
	if (!session) {
		return errorResponse;
	}

	const authorId = session.user.id;

	await connectMongoose();

	const { searchParams } = new URL(req.url);

	const limit = Math.min(
		Math.max(toIntParam(searchParams.get('limit'), 20), 1),
		100,
	);
	const page = Math.max(toIntParam(searchParams.get('page'), 1), 1);
	const from = toISODateWithStartOfDay(searchParams.get('from'));
	const to = toISODateWithEndOfDay(searchParams.get('to'));
	const filter = buildAuthorPostsFilter(authorId, from, to);

	const total = await Posts.countDocuments(filter);
	const maxPage = Math.max(1, Math.ceil(total / limit));

	if (page > maxPage) {
		return NextResponse.json({ message: 'invalid page' }, { status: 400 });
	}

	const skip = (page - 1) * limit;

	const postsEnc = await Posts.find(filter)
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	const posts = await Promise.all(
		postsEnc.map(async (doc) => {
			const obj = doc.toObject();

			const { titleEnc, bodyEnc, ...rest } = obj;

			const title = await decrypt(titleEnc as AES256GCMEncryptedData, authorId);
			const body = await decrypt(bodyEnc as AES256GCMEncryptedData, authorId);

			return {
				...rest,
				title,
				body,
			};
		}),
	);

	return NextResponse.json({
		posts,
		page,
		maxPage,
		total,
		limit,
	});
}
