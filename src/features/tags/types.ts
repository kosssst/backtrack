export type TagContent = {
	text: string;
	color: string;
};

export type Tag = TagContent & {
	_id: string;
	authorId: string;
	createdAt: string;
	updatedAt: string;
};

export type TagPayloadResult =
	| {
			ok: true;
			value: TagContent;
	  }
	| {
			ok: false;
			message: string;
			cause?: unknown;
	  };
