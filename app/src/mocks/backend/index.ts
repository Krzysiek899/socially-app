import { authHandlers } from './auth.ts';
import { discoverHandlers } from './discover.ts';

export const handlers = [...authHandlers, ...discoverHandlers];
