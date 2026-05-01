import type { Metadata } from 'next';
import '@/shared/styles/globals.css';
import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import {
	ColorSchemeScript,
	MantineProvider,
	mantineHtmlProps,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

/** Default metadata for all application routes. */
export const metadata: Metadata = {
	title: 'Backtrack',
	description: 'Created by kosssst',
};

/**
 * Defines application-wide providers, styles, and document metadata.
 */
export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider
					withCssVariables
					withGlobalClasses
					defaultColorScheme={'dark'}
				>
					<ModalsProvider>
						<Notifications position="bottom-right" />
						<div className="appShell">{children}</div>
					</ModalsProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
