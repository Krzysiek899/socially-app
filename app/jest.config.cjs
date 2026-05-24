/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    // Stub CSS imports — tokens are tested via the JS constants module
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
