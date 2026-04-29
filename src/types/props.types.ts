import { DatesRangeValue } from '@mantine/dates';

export type PostFormValues = {
	title: string;
	body: string;
};

export type PostFormProps = {
	mode?: 'create' | 'edit';
	postId?: string;
	initialValues?: PostFormValues;
	onSuccess: (values: PostFormValues) => void;
	onCancel: () => void;
	onFailure: () => void;
};

export type PostsListProps = {
	reloadKey?: number;
	dateRange?: DatesRangeValue;
};

export interface AuthPageProps {
	searchParams: Promise<{
		redirect: string;
	}>;
}

export interface AuthFormProps {
	redirectTo: string;
}

export interface UserProps {
	user: {
		name: string;
		email: string;
	};
}
