'use client';

import { Button, Container, Group } from '@mantine/core';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { useState } from 'react';
import { PostForm } from '@/features/posts/components/PostForm';
import { PostsList } from '@/features/posts/components/PostsList';
import {
	showFailure,
	showSuccess,
} from '@/shared/notifications/app-notifications';
import { IconPlusFilled } from '@tabler/icons-react';

/**
 * Coordinates post creation, date filtering, and timeline refresh state.
 */
export function PostsPage() {
	const [reloadKey, setReloadKey] = useState(0);
	const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
	const [isCreatePostFormVisible, setIsCreatePostFormVisible] = useState(false);

	const handleCreated = () => {
		setIsCreatePostFormVisible(false);
		setReloadKey((k) => k + 1);
		showSuccess('Post created successfully');
	};

	const handleFailed = () => {
		showFailure('Failed to create post');
	};

	return (
		<Container size="md" px="md">
			<Group justify="space-between" align="center" mb="md">
				<Button
					onClick={() => {
						setIsCreatePostFormVisible(true);
					}}
					leftSection={<IconPlusFilled size={20} />}
				>
					New post
				</Button>
				<DatePickerInput
					style={{ flex: 1, maxWidth: 220 }}
					allowSingleDateInRange
					clearable
					type="range"
					value={dateRange}
					onChange={setDateRange}
					valueFormat="DD.MM.YYYY"
					label="Pick time range"
					placeholder="Pick dates"
					maxDate={new Date()}
				/>
			</Group>
			{isCreatePostFormVisible && (
				<PostForm
					onSuccess={handleCreated}
					onCancel={() => setIsCreatePostFormVisible(false)}
					onFailure={handleFailed}
				/>
			)}
			<PostsList reloadKey={reloadKey} dateRange={dateRange} />
		</Container>
	);
}
