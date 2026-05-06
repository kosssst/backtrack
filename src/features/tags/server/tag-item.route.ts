import { requireApiSession } from '@/features/auth/server/require-api-session';
import {
	deleteTagForAuthor,
	readTagPayload,
	updateTagForAuthor,
} from '@/features/tags/server/tag.service';
import { logger } from '@/shared/logging/logger';
import { NextResponse } from 'next/server';

/**
 * Updates an existing tag owned by the authenticated user.
 */
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ tagId: string }> },
) {
	const { session, errorResponse } = await requireApiSession(request);

	if (!session) {
		return errorResponse;
	}

	const { tagId } = await params;
	const payload = await readTagPayload(request);

	if (!payload.ok) {
		if (payload.cause) {
			logger.warn('Rejected tag payload', {
				error: payload.cause,
				route: `PUT /api/tags/${tagId}`,
				status: 400,
			});
		}
		return NextResponse.json({ message: payload.message }, { status: 400 });
	}

	try {
		const isUpdated = await updateTagForAuthor(
			tagId,
			session.user.id,
			payload.value,
		);

		if (!isUpdated) {
			return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
		}
	} catch (error) {
		logger.error('Failed to update tag', {
			authorId: session.user.id,
			error,
			route: `PUT /api/tags/${tagId}`,
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to update the tag' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: tagId }, { status: 200 });
}

/**
 * Deletes an existing tag owned by the authenticated user.
 */
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ tagId: string }> },
) {
	const { session, errorResponse } = await requireApiSession(request);
	if (!session) {
		return errorResponse;
	}

	const { tagId } = await params;

	try {
		const isDeleted = await deleteTagForAuthor(tagId, session.user.id);

		if (!isDeleted) {
			return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
		}
	} catch (error) {
		logger.error('Failed to delete tag', {
			authorId: session.user.id,
			error,
			route: `DELETE /api/tags/${tagId}`,
			status: 500,
		});
		return NextResponse.json(
			{ message: 'Unable to delete tag' },
			{ status: 500 },
		);
	}

	return NextResponse.json({ _id: tagId }, { status: 200 });
}
