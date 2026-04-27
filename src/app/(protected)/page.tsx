'use client';

import { Button, Container, Group } from '@mantine/core';
import { CreatePostForm } from '@/components/forms/CreatePostForm';
import { PostsList } from '@/components/lists/PostsList';
import { useState } from 'react';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';

export default function Home() {
	const [reloadKey, setReloadKey] = useState(0);
	const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);
	const [isCreatePostFormVisible, setIsCreatePostFormVisible] = useState(false);

	const handleCreated = () => {
		setIsCreatePostFormVisible(false);
		setReloadKey((k) => k + 1);
	};

	return (
		<>
			<Container size="md" px="md">
				<Group justify="space-between" align="center" mb="md">
					<Button onClick={() => {setIsCreatePostFormVisible(true)}}>Create post</Button>
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
				{ isCreatePostFormVisible && <CreatePostForm onSuccess={handleCreated} onCancel={() => setIsCreatePostFormVisible(false)} />}
				<PostsList reloadKey={reloadKey} dateRange={dateRange} />
			</Container>
		</>
	);
}
