'use client';

import { Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { hasLength, matches, useForm } from '@mantine/form';
import { ColorPicker } from '@/shared/components/input/ColorPicker';
import {
	TAG_COLOR_REGEX,
	TAG_TEXT_MAX_LENGTH,
} from '@/features/tags/constants';
import { createTag, updateTag } from '@/features/tags/api/tags-client';
import type { TagFormProps } from '@/features/tags/types';
import classes from '@/shared/styles/form.module.css';
import { reportClientError } from '@/shared/logging/report-client-error';

export function TagForm(props: TagFormProps) {
	const isEdit = props.mode === 'edit';
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			text: '',
			color: '',
			...props.initialValues,
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
			if (isEdit) {
				await updateTag({ _id: props.tagId, ...form.values });
			} else {
				await createTag(form.values);
			}
		} catch (error) {
			reportClientError(error);
			props.onFailure();
			return;
		}

		props.onSuccess(form.values);
	};

	const handleCancel = () => {
		props.onCancel();
	};

	return (
		<Paper withBorder shadow="sm" radius="md" p="sm">
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					<Title order={3}>{isEdit ? 'Edit tag' : 'Create new tag'}</Title>
					<TextInput
						label="Name"
						placeholder="Tag name"
						required
						radius="md"
						key={form.key('text')}
						{...form.getInputProps('text')}
					/>
					<ColorPicker
						label="Color"
						required
						key={form.key('color')}
						{...form.getInputProps('color')}
					/>
					<div className={classes.actions}>
						<Button
							radius="md"
							onClick={handleCancel}
							variant="outline"
							color="red"
						>
							Cancel
						</Button>
						<Button type="submit" radius="md">
							{isEdit ? 'Save' : 'Create'}
						</Button>
					</div>
				</Stack>
			</form>
		</Paper>
	);
}
