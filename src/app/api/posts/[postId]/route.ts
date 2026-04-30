/** Post routes use Node.js APIs for MongoDB and encryption. */
export const runtime = 'nodejs';

/** Route handlers are implemented in the posts feature module. */
export { DELETE, PUT } from '@/features/posts/server/post-item-route';
