import { requireApiSession } from '@/lib/auth/require-api-session';
import { UpdatePostRequestPayload } from '@/types/posts.types';
import { readJsonWithLimit } from '@/lib/utils/json';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption/aes-265-gcm';
import { connectMongoose } from '@/lib/db/mongoose';
import { Posts } from '@/models/posts.model';

const MAX_POST_BYTES = 32 * 1024; // 32 KB

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const { session, errorResponse } = await requireApiSession(req);

	if (!session) {
		return errorResponse;
	}

	const { postId } = await params;

	let data: UpdatePostRequestPayload;

	try {
		data = await readJsonWithLimit<UpdatePostRequestPayload>(
			req,
			MAX_POST_BYTES,
		);
	} catch (error) {
		logger.error(error);
		return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
	}

	const title = (data?.title ?? '').toString().trim();
	const body = (data?.body ?? '').toString().trim();

	if (!title || title.length > 200)
		return NextResponse.json({ message: 'Invalid title' }, { status: 400 });
	if (!body || body.length > 20_000)
		return NextResponse.json({ message: 'Invalid content' }, { status: 400 });

	const titleEnc = await encrypt(title, session.user.id);
	const bodyEnc = await encrypt(body, session.user.id);

	try {
		await connectMongoose();
		const updateResult = await Posts.updateOne(
			{ _id: postId, authorId: session.user.id },
			{ titleEnc: { v: 1, ...titleEnc }, bodyEnc: { v: 1, ...bodyEnc } },
		);
		if (updateResult.matchedCount === 0)
			return NextResponse.json({ message: 'Post not found' }, { status: 404 });
	} catch (error) {
		logger.error(error);
		return NextResponse.json(
			{ message: 'Unable to update the post' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: postId }, { status: 200 });
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const { session, errorResponse } = await requireApiSession(req);
	if (!session) {
		return errorResponse;
	}

	const { postId } = await params;

	try {
		await connectMongoose();
		const deleteResult = await Posts.deleteOne({
			_id: postId,
			authorId: session.user.id,
		});
		if (deleteResult.deletedCount === 0)
			return NextResponse.json({ message: 'Post not found' }, { status: 404 });
	} catch (error) {
		logger.error(error);
		return NextResponse.json(
			{ message: 'Unable to delete post' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: postId }, { status: 200 });
}
