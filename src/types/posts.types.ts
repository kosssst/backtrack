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
	_id: string;
	title: string;
	body: string;
}
