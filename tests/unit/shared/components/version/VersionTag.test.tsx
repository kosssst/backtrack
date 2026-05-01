import { renderWithMantine } from '@test/render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/config/public-env', () => ({
	publicEnv: {
		APP_VERSION: '1.2.3',
	},
}));

import { VersionTag } from '@/shared/components/version/VersionTag';

describe('VersionTag', () => {
	it('renders the application version', () => {
		renderWithMantine(<VersionTag />);
		expect(screen.getByText('v1.2.3')).toBeInTheDocument();
	});
});
