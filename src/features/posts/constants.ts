/** Maximum post title length accepted by client and server validation. */
export const POST_TITLE_MAX_LENGTH = 200;

/** Maximum post body length accepted by client and server validation. */
export const POST_BODY_MAX_LENGTH = 20_000;

/** Maximum JSON request body size for post write endpoints. */
export const POST_REQUEST_MAX_BYTES = 32 * 1024;

/** First page index used by post pagination. */
export const POSTS_DEFAULT_PAGE = 1;

/** Default number of posts requested per page. */
export const POSTS_DEFAULT_PAGE_LIMIT = 20;

/** Hard cap for page size accepted by the posts API. */
export const POSTS_MAX_PAGE_LIMIT = 100;
