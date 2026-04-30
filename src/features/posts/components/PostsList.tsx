'use client';

import { Post as PostRecord, PostsListProps } from '@/features/posts/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPosts } from '@/features/posts/api/posts-client';
import { useIntersection } from '@mantine/hooks';
import { Center, Loader, Stack } from '@mantine/core';
import { Post } from '@/features/posts/components/Post';
import { showError } from '@/shared/notifications/app-notifications';
import { reportClientError } from '@/shared/logging/report-client-error';
import { POSTS_DEFAULT_PAGE_LIMIT } from '@/features/posts/constants';

/**
 * Renders an infinite-scrolling list of posts for the selected date range.
 */
export function PostsList({
	reloadKey = 0,
	dateRange = [null, null],
}: PostsListProps) {
	const [posts, setPosts] = useState<PostRecord[]>([]);
	const [page, setPage] = useState(1);
	const [maxPage, setMaxPage] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	// Refs gate overlapping fetches immediately; state updates are too late for fast intersection callbacks.
	const loadingRef = useRef(false);
	const maxPageRef = useRef<number | null>(null);

	const hasMore = useMemo(
		() => (maxPage === null ? true : page < maxPage),
		[page, maxPage],
	);

	const { ref: sentinelRef, entry } = useIntersection({ threshold: 1 });

	const loadPage = useCallback(
		async (targetPage: number, isReserved = false) => {
			if (!isReserved && loadingRef.current) return;
			if (maxPageRef.current !== null && targetPage > maxPageRef.current) {
				if (isReserved) loadingRef.current = false;
				return;
			}

			loadingRef.current = true;

			setLoading(true);

			try {
				const data = await getPosts({
					page: targetPage,
					limit: POSTS_DEFAULT_PAGE_LIMIT,
					from: dateRange[0],
					to: dateRange[1],
				});

				maxPageRef.current = data.maxPage;
				setMaxPage(data.maxPage);
				setPage(data.page);
				setPosts((prev) => {
					if (targetPage === 1) return data.posts;

					const seen = new Set(prev.map((p) => p._id));
					const next = data.posts.filter((p) => !seen.has(p._id));
					return [...prev, ...next];
				});
			} catch (error) {
				reportClientError(error);
				showError('Failed to fetch posts');
			} finally {
				loadingRef.current = false;
				setLoading(false);
			}
		},
		[dateRange],
	);

	const scheduleLoadPage = useCallback(
		(targetPage: number) => {
			if (loadingRef.current) return;
			if (maxPageRef.current !== null && targetPage > maxPageRef.current)
				return;

			loadingRef.current = true;

			queueMicrotask(() => {
				void loadPage(targetPage, true);
			});
		},
		[loadPage],
	);

	const handlePostUpdated = (updatedPost: PostRecord) => {
		setPosts((prev) =>
			prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
		);
	};

	const handlePostDeleted = (postId: string) => {
		setPosts((prev) => prev.filter((post) => post._id !== postId));
	};

	useEffect(() => {
		loadingRef.current = false;
		maxPageRef.current = null;

		scheduleLoadPage(1);
	}, [reloadKey, scheduleLoadPage]);

	useEffect(() => {
		if (!entry?.isIntersecting) return;
		if (!hasMore) return;
		if (loadingRef.current) return;

		scheduleLoadPage(page + 1);
	}, [entry?.isIntersecting, page, hasMore, scheduleLoadPage]);

	return (
		<Stack gap="md">
			{posts.map((p) => (
				<Post
					key={p._id}
					{...p}
					onUpdated={handlePostUpdated}
					onDeleted={handlePostDeleted}
				/>
			))}

			{hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

			{loading && (
				<Center>
					<Loader />
				</Center>
			)}
		</Stack>
	);
}
