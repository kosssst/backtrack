import { NextResponse } from 'next/server';
import {
	toISODateWithEndOfDay,
	toISODateWithStartOfDay,
} from '@/features/posts/utils/format-post-date';
import { requireApiSession } from '@/features/auth/server/require-api-session';
import { logger } from '@/shared/logging/logger';
import {
	createPostForAuthor,
	listPostsForAuthor,
	parsePostsPagination,
	readPostPayload,
} from '@/features/posts/server/post.service';

/**
 * Creates an encrypted post for the authenticated user.
 */
export async function POST(req: Request) {
	const { session, errorResponse } = await requireApiSession(req);
	if (!session) {
		return errorResponse;
	}

	const payload = await readPostPayload(req);

	if (!payload.ok) {
		if (payload.cause) {
			logger.warn('Rejected post payload', {
				error: payload.cause,
				route: 'POST /api/posts',
				status: 400,
			});
		}
		return NextResponse.json({ message: payload.message }, { status: 400 });
	}

	try {
		const postId = await createPostForAuthor(session.user.id, payload.value);
		return NextResponse.json({ _id: postId }, { status: 201 });
	} catch (error) {
		logger.error('Failed to create post', {
			authorId: session.user.id,
			error,
			route: 'POST /api/posts',
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to create a post' },
			{ status: 500 },
		);
	}
}

/**
 * Returns a paginated list of decrypted posts for the authenticated user.
 */
export async function GET(req: Request) {
	const { session, errorResponse } = await requireApiSession(req);
	if (!session) {
		return errorResponse;
	}

	const authorId = session.user.id;
	const { searchParams } = new URL(req.url);
	const { page, limit } = parsePostsPagination(searchParams);
	const from = toISODateWithStartOfDay(searchParams.get('from'));
	const to = toISODateWithEndOfDay(searchParams.get('to'));

	let result: Awaited<ReturnType<typeof listPostsForAuthor>>;

	try {
		result = await listPostsForAuthor({ authorId, page, limit, from, to });
	} catch (error) {
		logger.error('Failed to list posts', {
			authorId,
			error,
			route: 'GET /api/posts',
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to list posts' },
			{ status: 500 },
		);
	}

	if (!result.ok) {
		return NextResponse.json({ message: result.message }, { status: 400 });
	}

	const { ok: _ok, ...response } = result;
	return NextResponse.json(response);
}
