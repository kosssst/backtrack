import 'server-only';

import { PostContent } from '@/features/posts/types';
import {
	POST_BODY_MAX_LENGTH,
	POST_REQUEST_MAX_BYTES,
	POST_TITLE_MAX_LENGTH,
} from '@/features/posts/constants';
import { readJsonWithLimit } from '@/shared/utils/json';

type PostPayloadResult =
	| {
			ok: true;
			value: PostContent;
	  }
	| {
			ok: false;
			message: string;
			cause?: unknown;
	  };

function normalizePostPayload(data: unknown): PostPayloadResult {
	const source = data as Partial<Record<keyof PostContent, unknown>> | null;
	const title = (source?.title ?? '').toString().trim();
	const body = (source?.body ?? '').toString().trim();

	if (!title || title.length > POST_TITLE_MAX_LENGTH) {
		return { ok: false, message: 'Invalid title' };
	}

	if (!body || body.length > POST_BODY_MAX_LENGTH) {
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
