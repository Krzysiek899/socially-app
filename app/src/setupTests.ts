import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

const makeMatchMedia = () =>
  jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: makeMatchMedia(),
});

beforeEach(() => {
  if (typeof window.matchMedia !== 'function' || !('mock' in window.matchMedia)) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: makeMatchMedia(),
    });
    return;
  }

  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

jest.mock('./pages/discover/DiscoverMap.tsx', () => ({
  DiscoverMap: () => null,
}));

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}
