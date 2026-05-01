/** Post routes use Node.js APIs for MongoDB and encryption. */
export const runtime = 'nodejs';

/** Route handlers are implemented in the posts feature module. */
export { GET, POST } from '@/features/posts/server/posts.route';
