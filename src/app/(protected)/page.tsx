'use client';

import { Button, Container, Group } from '@mantine/core';
import { PostForm } from '@/components/forms/PostForm';
import { PostsList } from '@/components/lists/PostsList';
import { useState } from 'react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { notifications } from '@mantine/notifications';

export default function Home() {
	const [reloadKey, setReloadKey] = useState(0);
	const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
	const [isCreatePostFormVisible, setIsCreatePostFormVisible] = useState(false);

	const handleCreated = () => {
		setIsCreatePostFormVisible(false);
		setReloadKey((k) => k + 1);
		notifications.show({
			color: 'green',
			title: 'Success',
			message: 'Post created successfully',
		});
	};

	const handleFailed = () => {
		notifications.show({
			color: 'red',
			title: 'Failure',
			message: 'Failed to create post',
		});
	};

	return (
		<>
			<Container size="md" px="md">
				<Group justify="space-between" align="center" mb="md">
					<Button
						onClick={() => {
							setIsCreatePostFormVisible(true);
						}}
					>
						Create post
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
		</>
	);
}
