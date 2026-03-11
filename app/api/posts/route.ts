import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/db/mongoose';
import { Posts } from '@/models/posts.model';
import { decrypt, encrypt } from '@/lib/encryption/aes-265-gcm';
import { AES256GCMEncryptedData } from '@/types/encryption.types';
import {
	toISODateWithEndOfDay,
	toISODateWithStartOfDay,
} from '@/lib/utils/format-date';
import {requireApiSession} from "@/lib/auth/require-api-session";

export const runtime = 'nodejs';

function toIntParam(value: string | null, fallback: number) {
	if (value == null || value.trim() === '') return fallback;

	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
	const { session, errorResponse } = await requireApiSession(req);
	if (!session) {
		return errorResponse;
	}

	const data = await req.json().catch(() => null);
	const title = (data?.title ?? '').toString().trim();
	const body = (data?.body ?? '').toString().trim();

	if (!title || title.length > 200) {
		return NextResponse.json({ message: 'Invalid title' }, { status: 400 });
	}
	if (!body || body.length > 20_000) {
		return NextResponse.json({ message: 'Invalid content' }, { status: 400 });
	}

	const titleEnc = await encrypt(title, session.user.id);
	const bodyEnc = await encrypt(body, session.user.id);

	await connectMongoose();

	const post = await Posts.create({
		titleEnc: { v: 1, ...titleEnc },
		bodyEnc: { v: 1, ...bodyEnc },
		authorId: session.user.id,
	});

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

	const total =
		from && to
			? await Posts.countDocuments({
					authorId: authorId,
					createdAt: { $gte: from, $lte: to },
				})
			: await Posts.countDocuments({ authorId: authorId });
	const maxPage = Math.max(1, Math.ceil(total / limit));

	if (page > maxPage) {
		return NextResponse.json({ message: 'invalid page' }, { status: 400 });
	}

	const skip = (page - 1) * limit;

	const postsEnc =
		from && to
			? await Posts.find({
					authorId: authorId,
					createdAt: { $gte: from, $lte: to },
				})
					.sort({ createdAt: -1 })
					.skip(skip)
					.limit(limit)
			: await Posts.find({ authorId: authorId })
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
