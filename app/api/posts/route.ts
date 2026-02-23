import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import { Posts } from '@/models/posts.model';

export const runtime = 'nodejs';

function toIntParam(value: string | null, fallback: number) {
	if (value == null || value.trim() === '') return fallback;

	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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

	await connectMongoose();

	const post = await Posts.create({
		title: title,
		body: body,
		authorId: session.user.id,
	});

	return NextResponse.json(post, { status: 201 });
}

export async function GET(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const authorId = session.user.id;

	await connectMongoose();

	const { searchParams } = new URL(req.url);

	const limit = Math.min(
		Math.max(toIntParam(searchParams.get('limit'), 20), 1),
		100,
	);
	const page = Math.max(toIntParam(searchParams.get('page'), 1), 1);

	const total = await Posts.countDocuments();
	const maxPage = Math.max(1, Math.ceil(total / limit));

	if (page > maxPage) {
		return NextResponse.json({ message: 'invalid page' }, { status: 400 });
	}

	const skip = (page - 1) * limit;

	const posts = await Posts.find({ authorId: authorId })
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();

	return NextResponse.json({
		posts,
		page,
		maxPage,
		total,
		limit,
	});
}
