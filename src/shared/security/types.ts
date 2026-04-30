/** AES-256-GCM encrypted payload stored in MongoDB. */
export type AES256GCMEncryptedData = {
	alg: string;
	iv: Buffer;
	ct: Buffer;
	tag: Buffer;
};

/** Minimal shape used by BSON Binary-like values returned by MongoDB drivers. */
export type BsonBinaryLike = {
	_bsontype: 'Binary';
	value: (asRaw?: boolean) => Buffer;
};
