import { Button, Paper, Stack, Textarea, TextInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import classes from '@/shared/styles/form.module.css';
import { createPost, updatePost } from '@/features/posts/api/posts-client';
import { PostFormProps } from '@/features/posts/types';
import {
	POST_BODY_MAX_LENGTH,
	POST_TITLE_MAX_LENGTH,
} from '@/features/posts/constants';
import { reportClientError } from '@/shared/logging/report-client-error';

/**
 * Renders the create/edit post form with shared validation rules.
 */
export function PostForm(props: PostFormProps) {
	const isEdit = props.mode === 'edit';

	const form = useForm({
		mode: 'controlled',
		initialValues: {
			title: '',
			body: '',
			...props.initialValues,
		},

		validate: {
			title: hasLength(
				{ min: 1, max: POST_TITLE_MAX_LENGTH },
				`Title should be between 1 and ${POST_TITLE_MAX_LENGTH} characters long.`,
			),
			body: hasLength(
				{ min: 1, max: POST_BODY_MAX_LENGTH },
				`Body should be between 1 and ${POST_BODY_MAX_LENGTH.toLocaleString()} characters long.`,
			),
		},
	});

	const handleSubmit = async () => {
		try {
			if (isEdit) {
				await updatePost({ _id: props.postId, ...form.values });
			} else {
				await createPost(form.values);
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
		<Paper withBorder shadow="md" radius="lg" p="md" mb="md">
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					<TextInput
						label="Title"
						placeholder="Title of your post"
						required
						radius="md"
						key={form.key('title')}
						{...form.getInputProps('title')}
					/>
					<Textarea
						label="Body"
						placeholder="Text of your post"
						required
						radius="md"
						key={form.key('body')}
						{...form.getInputProps('body')}
						autosize
						minRows={4}
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
