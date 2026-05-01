import 'server-only';
import { createRuntimeEnvGetter } from '../cache';
import { readLoggerEnv } from './server-env';

/** Runtime logging configuration parsed from server environment variables. */
export const getLoggerEnv = createRuntimeEnvGetter(readLoggerEnv);
