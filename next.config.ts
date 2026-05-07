import type { NextConfig } from 'next';
import pkg from './package.json';

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_APP_VERSION: pkg.version,
	},
	output: 'standalone',
	allowedDevOrigins: ['10.10.0.3'],
};

export default nextConfig;
