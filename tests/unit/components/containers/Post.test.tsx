import { renderWithMantine } from '@test/render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/format-date', () => ({
	formatPostDate: vi.fn(() => '21:23 23.02.2026'),
}));

import { Post } from '@/components/containers/Post';

describe('Post', () => {
	it('renders title, body and formatted creation date', () => {
		renderWithMantine(
			<Post
				_id="post-1"
				title="First post"
				body={'Hello\nworld'}
				authorId="user-1"
				createdAt="2026-02-23T21:23:01.104Z"
				updatedAt="2026-02-23T21:23:01.104Z"
			/>,
		);

		expect(screen.getByRole('heading', { name: 'First post' })).toBeInTheDocument();
		expect(screen.getByText(/Hello\s*world/)).toBeInTheDocument();
		expect(screen.getByText('21:23 23.02.2026')).toBeInTheDocument();
	});
});
