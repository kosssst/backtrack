import 'server-only';
import mongoose from 'mongoose';
import { logger } from '@/shared/logging/logger';
import { MongooseCache } from '@/shared/database/types';
import { getDbEnv } from '@/shared/config/env/runtime/db-env';

declare global {
	var mongooseCache: MongooseCache | undefined;
}

// Next.js can reload server modules during development; keeping the connection on global avoids duplicate pools.
const cache: MongooseCache = global.mongooseCache ?? {
	conn: null,
	promise: null,
};
global.mongooseCache = cache;

mongoose.set('strictQuery', true);

/**
 * Opens and caches the Mongoose connection for server-side data access.
 */
export async function connectMongoose() {
	const { MONGODB_URL } = getDbEnv();
	if (cache.conn) return cache.conn;

	if (!cache.promise) {
		cache.promise = mongoose
			.connect(MONGODB_URL, { dbName: 'backtrack' })
			.then((m) => m);
	}

	try {
		cache.conn = await cache.promise;
		logger.debug('Mongoose connected');
		return cache.conn;
	} catch (err) {
		cache.promise = null;
		throw err;
	}
}
