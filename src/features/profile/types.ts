/** User fields displayed by profile and shell components. */
export type UserProfile = {
	name: string;
	email: string;
};

/** Standard prop shape for components that render the current user. */
export type UserProfileProps = {
	user: UserProfile;
};
