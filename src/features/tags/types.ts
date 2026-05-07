import type { InputWrapperProps } from '@mantine/core';

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

export type TagColorPickerProps = Omit<
	InputWrapperProps,
	'children' | 'defaultValue' | 'onChange' | 'value'
> & {
	defaultColors?: string[];
	value?: string;
	defaultValue?: string;
	onChange?: (color: string) => void;
	disabled?: boolean;
	name?: string;
};
