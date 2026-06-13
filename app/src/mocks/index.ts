import { authHandlers } from './auth/handlers.ts';
import { discoverHandlers } from './discover/handlers.ts';
import { eventManagementHandlers } from './event-management/handlers.ts';
import { profileHandlers } from './profile/handlers.ts';

export const handlers = [...authHandlers, ...discoverHandlers, ...eventManagementHandlers, ...profileHandlers];
