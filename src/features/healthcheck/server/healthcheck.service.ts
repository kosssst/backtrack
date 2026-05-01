import { connectMongoose } from '@/shared/database/mongoose';

export async function checkDatabase() {
	const mongoose = await connectMongoose();
	const db = mongoose.connection.db;

	if (!db) {
		throw new Error('MongoDB connection is unavailable');
	}

	await db.command({ ping: 1 }, { timeoutMS: 1000 });
}
