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
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^\.\./utils/selectors.js$': '<rootDir>/src/utils/selectors.ts'
  }
};
