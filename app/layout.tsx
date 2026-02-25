import type { Metadata } from 'next';
import '../styles/globals.css';
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

export const metadata: Metadata = {
	title: 'Backtrack',
	description: 'Created by kosssst',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider withCssVariables withGlobalClasses>
					<Notifications position="bottom-right" />
					<div className="appShell">{children}</div>
				</MantineProvider>
			</body>
		</html>
	);
}
