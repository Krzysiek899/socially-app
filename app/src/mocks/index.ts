import { authHandlers } from './auth/handlers.ts';
import { discoverHandlers } from './discover/handlers.ts';

export const handlers = [...authHandlers, ...discoverHandlers];
