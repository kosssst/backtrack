export type SignUpFormData = {
	name: string;
	email: string;
	password: string;
	repeatPassword: string;
};

export type SignInFormData = {
	email: string;
	password: string;
};

export interface AuthPageProps {
	searchParams: Promise<{
		redirect: string;
	}>;
}

export interface AuthFormProps {
	redirectTo: string;
}
