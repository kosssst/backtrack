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
