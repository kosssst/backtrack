import { DatesRangeValue } from '@mantine/dates';

export type CreatePostFormProps = {
	onSuccess?: () => void;
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
