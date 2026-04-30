/** Public configuration that can be safely bundled into client code. */
export const publicEnv = {
	APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
} as const;
