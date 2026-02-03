import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

export const metadata: Metadata = {
  title: "Backtrack",
  description: "Created by kosssst",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" data-lt-installed="true" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
      <body>
				<MantineProvider>
        	{children}
				</MantineProvider>
      </body>
    </html>
  );
}
