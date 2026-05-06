import mongoose from 'mongoose';

/** Global Mongoose connection cache used across Next.js module reloads. */
export type MongooseCache = {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
};

export type AuthorPostsFilter = {
	authorId: string;
	createdAt?: { $gte: string; $lte: string };
};
