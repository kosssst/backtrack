import { requireApiSession } from '@/features/auth/server/require-api-session';
import { logger } from '@/shared/logging/logger';
import { NextResponse } from 'next/server';
import {
	deletePostForAuthor,
	readPostPayload,
	updatePostForAuthor,
} from '@/features/posts/server/post.service';

/**
 * Updates an existing post owned by the authenticated user.
 */
export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const { session, errorResponse } = await requireApiSession(req);

	if (!session) {
		return errorResponse;
	}

	const { postId } = await params;
	const payload = await readPostPayload(req);

	if (!payload.ok) {
		if (payload.cause) {
			logger.warn('Rejected post payload', {
				error: payload.cause,
				postId,
				route: 'PUT /api/posts/[postId]',
				status: 400,
			});
		}
		return NextResponse.json({ message: payload.message }, { status: 400 });
	}

	try {
		const isUpdated = await updatePostForAuthor(
			postId,
			session.user.id,
			payload.value,
		);

		if (!isUpdated) {
			return NextResponse.json({ message: 'Post not found' }, { status: 404 });
		}
	} catch (error) {
		logger.error('Failed to update post', {
			authorId: session.user.id,
			error,
			postId,
			route: 'PUT /api/posts/[postId]',
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to update the post' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: postId }, { status: 200 });
}

/**
 * Deletes an existing post owned by the authenticated user.
 */
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
		const isDeleted = await deletePostForAuthor(postId, session.user.id);

		if (!isDeleted) {
			return NextResponse.json({ message: 'Post not found' }, { status: 404 });
		}
	} catch (error) {
		logger.error('Failed to delete post', {
			authorId: session.user.id,
			error,
			postId,
			route: 'DELETE /api/posts/[postId]',
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to delete post' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: postId }, { status: 200 });
}
