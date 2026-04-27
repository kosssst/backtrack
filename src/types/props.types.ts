import { DatesRangeValue } from '@mantine/dates';

export type CreatePostFormProps = {
	onSuccess: () => void;
	onCancel: () => void;
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
