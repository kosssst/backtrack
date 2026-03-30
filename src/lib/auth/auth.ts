import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies, toNextJsHandler } from 'better-auth/next-js';
import { MongoClient } from 'mongodb';
import { getDbEnv } from '@/lib/env/runtime/db-env';
import { getAuthEnv } from '@/lib/env/runtime/auth-env';

const DB_NAME = 'backtrack';

type AuthInstance = ReturnType<typeof betterAuth>;

let mongoClientPromise: Promise<MongoClient> | null = null;
let authPromise: Promise<AuthInstance> | null = null;
let handlersPromise: Promise<ReturnType<typeof toNextJsHandler>> | null = null;

async function getMongoClient(): Promise<MongoClient> {
	if (!mongoClientPromise) {
		const { MONGODB_URL } = getDbEnv();
		mongoClientPromise = new MongoClient(MONGODB_URL).connect();
	}

	return mongoClientPromise;
}

async function createAuth(): Promise<AuthInstance> {
	const client = await getMongoClient();
	const db = client.db(DB_NAME);
	const { APP_ORIGIN } = getAuthEnv();

	return betterAuth({
		baseURL: APP_ORIGIN,
		database: mongodbAdapter(db),
		emailAndPassword: {
			enabled: true,
		},
		plugins: [nextCookies()],
	});
}

export async function getAuth(): Promise<AuthInstance> {
	if (!authPromise) {
		authPromise = createAuth();
	}

	return authPromise;
}

export async function getAuthHandlers() {
	if (!handlersPromise) {
		handlersPromise = getAuth().then((auth) => toNextJsHandler(auth));
	}

	return handlersPromise;
}
