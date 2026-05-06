import mongoose from 'mongoose';

export function isValidMongoObjectId(value: string) {
	return mongoose.isValidObjectId(value);
}
