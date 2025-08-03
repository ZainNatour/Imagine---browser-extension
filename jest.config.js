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
    '^\.\./utils/selectors.js$': '<rootDir>/src/utils/selectors.ts'
  }
};
