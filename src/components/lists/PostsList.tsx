'use client';

import { PostInterface } from '@/types/posts.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPosts } from '@/lib/api/posts.client';
import { notifications } from '@mantine/notifications';
import { useIntersection } from '@mantine/hooks';
import { Center, Loader, Stack } from '@mantine/core';
import { Post } from '@/components/containers/Post';
import { PostsListProps } from '@/types/props.types';

export function PostsList({
	reloadKey = 0,
	dateRange = [null, null],
}: PostsListProps) {
	const [posts, setPosts] = useState<PostInterface[]>([]);
	const [page, setPage] = useState(1);
	const [maxPage, setMaxPage] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const loadingRef = useRef(false);
	const maxPageRef = useRef<number | null>(null);

	const hasMore = useMemo(
		() => (maxPage === null ? true : page < maxPage),
		[page, maxPage],
	);

	const { ref: sentinelRef, entry } = useIntersection({ threshold: 1 });

	const loadPage = useCallback(
		async (targetPage: number) => {
			if (loadingRef.current) return;
			if (maxPageRef.current !== null && targetPage > maxPageRef.current)
				return;

			loadingRef.current = true;

			setLoading(true);

			try {
				const data = await getPosts({
					page: targetPage,
					limit: 20,
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
				console.error(error);
				notifications.show({
					title: 'Error',
					message: 'Failed to fetch posts',
					color: 'red',
				});
			} finally {
				loadingRef.current = false;
				setLoading(false);
			}
		},
		[dateRange],
	);

	const handlePostUpdated = (updatedPost: PostInterface) => {
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

		void (async () => {
			await Promise.resolve();
			await loadPage(1);
		})();
	}, [reloadKey, loadPage]);

	useEffect(() => {
		if (!entry?.isIntersecting) return;
		if (!hasMore) return;
		if (loadingRef.current) return;

		void (async () => {
			await Promise.resolve();
			await loadPage(page + 1);
		})();
	}, [entry?.isIntersecting, page, hasMore, loadPage]);

	return (
		<Stack gap="md">
			{posts.map((p) => (
				<Post key={p._id} {...p} onUpdated={handlePostUpdated} onDeleted={handlePostDeleted} />
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
