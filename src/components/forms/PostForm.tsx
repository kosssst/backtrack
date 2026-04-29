import { Button, Paper, Stack, Textarea, TextInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import classes from '@/styles/form.module.css';
import { createPost, updatePost } from '@/lib/api/posts.client';
import { PostFormProps } from '@/types/props.types';

export function PostForm(props: PostFormProps) {
	const isEdit = props.mode === 'edit';

	const form = useForm({
		mode: 'controlled',
		initialValues: props.initialValues ?? {
			title: '',
			body: '',
		},

		validate: {
			title: hasLength(
				{ min: 1, max: 200 },
				'Title should be between 1 and 200 characters long.',
			),
			body: hasLength(
				{ min: 1, max: 20_000 },
				'Body should be between 1 and 20,000 characters long.',
			),
		},
	});

	const handleSubmit = async () => {
		try {
			if (isEdit) {
				await updatePost({ _id: props.postId!, ...form.values });
			} else {
				await createPost(form.values);
			}
		} catch (error) {
			console.error(error);
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
			<form
				onSubmit={form.onSubmit(async () => {
					if (!form.isValid()) {
						form.validate();
						return;
					}
					await handleSubmit();
				})}
			>
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
						maxRows={20}
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
