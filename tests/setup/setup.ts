import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

vi.mock('server-only', () => ({}));

process.env.TZ = 'UTC';

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

Object.defineProperty(document, 'fonts', {
	writable: true,
	value: {
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	},
});

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

class IntersectionObserverMock {
	root = null;
	rootMargin = '';
	thresholds = [];
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = vi.fn();
}
