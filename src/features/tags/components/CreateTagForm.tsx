'use client';

import { TagColorPicker } from '@/features/tags/components/TagColorPicker';
import { hasLength, matches, useForm } from '@mantine/form';
import {
	TAG_COLOR_REGEX,
	TAG_TEXT_MAX_LENGTH,
} from '@/features/tags/constants';
import { Button, Stack, TextInput, Title } from '@mantine/core';
import { createTag } from '@/features/tags/api/tags-client';
import {
	showFailure,
	showSuccess,
} from '@/shared/notifications/app-notifications';

export function CreateTagForm() {
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			text: '',
			color: '',
		},
		validate: {
			text: hasLength(
				{ min: 1, max: TAG_TEXT_MAX_LENGTH },
				`Tag name should be between 1 and ${TAG_TEXT_MAX_LENGTH} characters long.`,
			),
			color: matches(
				TAG_COLOR_REGEX,
				'Color should be a valid hex value like #A1B2C3.',
			),
		},
	});

	const handleSubmit = async () => {
		try {
			await createTag(form.getValues());
			showSuccess('Tag created successfully');
			form.reset();
		} catch {
			showFailure(
				'Please check your details and try again.',
				'Tag creation failed',
			);
		}
	};

	return (
		<>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					<Title>Create new tag</Title>
					<TextInput
						label="Name"
						placeholder="Tag name"
						required
						radius="md"
						key={form.key('text')}
						{...form.getInputProps('text')}
					/>
					<TagColorPicker
						label="Color"
						required
						key={form.key('color')}
						{...form.getInputProps('color')}
					/>
					<Button type="submit">Create tag</Button>
				</Stack>
			</form>
		</>
	);
}
