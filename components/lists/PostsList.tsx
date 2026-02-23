'use client';

import { PostInterface } from '@/types/posts.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPosts } from '@/lib/api/posts.client';
import { notifications } from '@mantine/notifications';
import { useIntersection } from '@mantine/hooks';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { Post } from '@/components/containers/Post';
import { PostsListProps } from '@/types/props.types';

export function PostsList({ reloadKey = 0 }: PostsListProps) {
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

	const loadPage = useCallback(async (targetPage: number) => {
		if (loadingRef.current) return;
		if (maxPageRef.current !== null && targetPage > maxPageRef.current) return;

		loadingRef.current = true;

		setLoading(true);

		try {
			const data = await getPosts({ page: targetPage, limit: 20 });

			maxPageRef.current = data.maxPage;
			setMaxPage(data.maxPage);
			setPage(data.page);
			setPosts((prev) => {
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
	}, []);

	useEffect(() => {
		setPosts([]);
		setPage(1);
		setMaxPage(null);

		loadingRef.current = false;
		maxPageRef.current = null;

		void loadPage(1);
	}, [reloadKey, loadPage]);

	useEffect(() => {
		if (!entry?.isIntersecting) return;
		if (!hasMore) return;
		if (loadingRef.current) return;

		void loadPage(page + 1);
	}, [entry?.isIntersecting, page, hasMore, loadPage]);

	return (
		<Stack>
			{posts.map((p) => (
				<Post key={p._id} {...p} />
			))}

			{hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

			{loading && (
				<Center>
					<Loader />
				</Center>
			)}

			{!hasMore && posts.length > 0 && (
				<Text c="dimmed" ta="center">
					No more posts
				</Text>
			)}
		</Stack>
	);
}
