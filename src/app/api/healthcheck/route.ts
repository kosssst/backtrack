/** Healthcheck runs in Node.js to match the deployed server runtime. */
export const runtime = 'nodejs';

export { GET } from '@/features/healthcheck/server/healthcheck.route';
