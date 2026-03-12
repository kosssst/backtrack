import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { env } from '@/lib/env';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';

const client = await new MongoClient(env.MONGODB_URL).connect();
const db = client.db('backtrack');

export const auth = betterAuth({
	baseURL: env.APP_ORIGIN,
	database: mongodbAdapter(db),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [nextCookies()],
});
