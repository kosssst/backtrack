import { Button, Paper, Stack, Textarea, TextInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import classes from '@/styles/form.module.css';
import { createPost } from '@/lib/api/posts.client';
import { notifications } from '@mantine/notifications';
import { CreatePostFormProps } from '@/types/props.types';

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
	const form = useForm({
		mode: 'controlled',
		initialValues: {
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
			await createPost(form.values);
		} catch (error) {
			console.error(error);
			notifications.show({
				title: 'Post creation failed',
				message: 'Something went wrong',
				color: 'red',
			});
			return;
		}

		onSuccess?.();
		notifications.show({
			title: 'Success',
			message: 'Post created successfully',
			color: 'green',
		});
	};

	return (
		<div>
			<Paper>
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
								type="submit"
								radius="md"
								className={classes.fullWidthBtn}
							>
								Create
							</Button>
						</div>
					</Stack>
				</form>
			</Paper>
		</div>
	);
}
