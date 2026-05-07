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

export type TagsModalProps = {
	opened: boolean;
	onClose: () => void;
};

type BaseTagFormProps = {
	onSuccess: (values: TagContent) => void;
	onCancel: () => void;
	onFailure: () => void;
};

type CreateTagModeProps = BaseTagFormProps & {
	mode?: 'create';
	tagId?: never;
	initialValues?: Partial<TagContent>;
};

type EditTagModeProps = BaseTagFormProps & {
	mode: 'edit';
	tagId: string;
	initialValues: TagContent;
};

export type TagFormProps = CreateTagModeProps | EditTagModeProps;
