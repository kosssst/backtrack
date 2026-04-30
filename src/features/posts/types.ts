import { DatesRangeValue } from '@mantine/dates';

export interface PostInterface {
	_id: string;
	title: string;
	body: string;
	authorId: string;
	createdAt: string;
	updatedAt: string;
}

export type PostProps = PostInterface & {
	onUpdated: (post: PostInterface) => void;
	onDeleted: (postId: string) => void;
};

export interface PostsResponse {
	posts: PostInterface[];
	page: number;
	maxPage: number;
	total: number;
	limit: number;
}

export interface CreatePostRequestPayload {
	title: string;
	body: string;
}

export interface UpdatePostRequestPayload {
	title: string;
	body: string;
}

export type PostFormValues = {
	title: string;
	body: string;
};

export type PostFormProps = {
	mode?: 'create' | 'edit';
	postId?: string;
	initialValues?: PostFormValues;
	onSuccess: (values: PostFormValues) => void;
	onCancel: () => void;
	onFailure: () => void;
};

export type PostsListProps = {
	reloadKey?: number;
	dateRange?: DatesRangeValue;
};
