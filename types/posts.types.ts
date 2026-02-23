export interface PostInterface {
	_id: string;
	title: string;
	body: string;
	authorId: string;
	createdAt: string;
	updatedAt: string;
}

export interface PostsResponse {
	posts: PostInterface[];
	page: number;
	maxPage: number;
	total: number;
	limit: number;
}
