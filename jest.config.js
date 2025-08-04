export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'CommonJS'
      }
    }
  },
  roots: ['<rootDir>/test'],
  setupFiles: ['<rootDir>/test/setupTextEncoder.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^\.\./utils/selectors.js$': '<rootDir>/src/utils/selectors.ts',
    '^\./onProductDetected.js$': '<rootDir>/src/background/onProductDetected.ts',
    '^\./reviewQueue.js$': '<rootDir>/test/helpers/reviewQueueStub.ts',
    '\\.(css)$': '<rootDir>/test/styleStub.js'
  },
  coveragePathIgnorePatterns: ['src/background/', 'src/content/']
};
