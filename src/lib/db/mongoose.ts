import 'server-only';
import mongoose from 'mongoose';
import { logger } from '@/lib/logger';
import { MongooseCache } from '@/types/mongoose.types';
import { getDbEnv } from '@/lib/env/runtime/db-env';

declare global {
	var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
	conn: null,
	promise: null,
};
global.mongooseCache = cache;

mongoose.set('strictQuery', true);

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
