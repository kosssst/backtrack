import { requireApiSession } from '@/features/auth/server/require-api-session';
import { logger } from '@/shared/logging/logger';
import { NextResponse } from 'next/server';
import {
	createTagForAuthor,
	getTagsForAuthor,
	readTagPayload,
} from '@/features/tags/server/tag.service';

/**
 * Creates encrypted tag for authenticated user
 */
export async function POST(request: Request) {
	const { session, errorResponse } = await requireApiSession(request);
	if (!session) {
		return errorResponse;
	}

	const payload = await readTagPayload(request);

	if (!payload.ok) {
		if (payload.cause) {
			logger.warn('Rejected tag payload', {
				error: payload.cause,
				route: 'POST /api/tags',
				status: 400,
			});
		}
		return NextResponse.json({ message: payload.message }, { status: 400 });
	}

	try {
		const tagId = await createTagForAuthor(session.user.id, payload.value);
		return NextResponse.json({ _id: tagId }, { status: 201 });
	} catch (error) {
		logger.error('Failed to create tag', {
			authorId: session.user.id,
			error,
			route: 'POST /api/tags',
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to create a tag' },
			{ status: 500 },
		);
	}
}

/**
 * Returns list of all tags of authenticated user
 */
export async function GET(request: Request) {
	const { session, errorResponse } = await requireApiSession(request);
	if (!session) {
		return errorResponse;
	}

	const authorId = session.user.id;

	try {
		const tags = await getTagsForAuthor(authorId);
		return NextResponse.json(tags, { status: 200 });
	} catch (error) {
		logger.error('Failed to get tags', {
			authorId: session.user.id,
			error,
			route: 'GET /api/tags',
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to get tags' },
			{ status: 500 },
		);
	}
}
