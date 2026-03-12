import 'server-only';
import mongoose from 'mongoose';
import { getEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { MongooseCache } from '@/types/mongoose.types';

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
	const env = getEnv();
	if (cache.conn) return cache.conn;

	if (!cache.promise) {
		cache.promise = mongoose
			.connect(env.MONGODB_URL, { dbName: 'backtrack' })
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
