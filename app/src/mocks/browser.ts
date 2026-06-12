import { setupWorker } from 'msw/browser';
import { handlers } from './index.ts';

const worker = setupWorker(...handlers);

export const startMockServiceWorker = async () => {
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
};
