export interface AES256GCMEncryptedData {
	alg: string;
	iv: Buffer;
	ct: Buffer;
	tag: Buffer;
}

export type BsonBinaryLike = {
	_bsontype: 'Binary';
	value: (asRaw?: boolean) => Buffer;
};
