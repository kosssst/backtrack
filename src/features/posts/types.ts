import { DatesRangeValue } from '@mantine/dates';

/** Plaintext post fields accepted by forms and write APIs before encryption. */
export type PostContent = {
	title: string;
	body: string;
};

/** Decrypted post record returned to authenticated clients. */
export type Post = PostContent & {
	_id: string;
	authorId: string;
	createdAt: string;
	updatedAt: string;
};

/** Props for a single rendered post card. */
export type PostProps = Post & {
	onUpdated: (post: Post) => void;
	onDeleted: (postId: string) => void;
};

/** Paginated posts API response. */
export type PostsResponse = {
	posts: Post[];
	page: number;
	maxPage: number;
	total: number;
	limit: number;
};

type BasePostFormProps = {
	onSuccess: (values: PostContent) => void;
	onCancel: () => void;
	onFailure: () => void;
};

type CreatePostFormProps = BasePostFormProps & {
	mode?: 'create';
	postId?: never;
	initialValues?: Partial<PostContent>;
};

type EditPostFormProps = BasePostFormProps & {
	mode: 'edit';
	postId: string;
	initialValues: PostContent;
};

/** Props accepted by the create/edit post form. */
export type PostFormProps = CreatePostFormProps | EditPostFormProps;

/** Controls pagination refresh and date filtering for the posts list. */
export type PostsListProps = {
	reloadKey?: number;
	dateRange?: DatesRangeValue;
};
