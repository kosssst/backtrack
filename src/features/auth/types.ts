/** Form values collected by the registration form. */
export type SignUpFormData = {
	name: string;
	email: string;
	password: string;
	repeatPassword: string;
};

/** Form values collected by the login form. */
export type SignInFormData = {
	email: string;
	password: string;
	rememberMe: boolean;
};

/** Next.js search parameters accepted by public auth pages. */
export type AuthPageProps = {
	searchParams: Promise<{
		redirect: string;
	}>;
};

/** Shared redirect prop passed to public auth forms. */
export type AuthRedirectProps = {
	redirectTo: string;
};
