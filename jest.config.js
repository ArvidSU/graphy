export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [ '<rootDir>/src/test/setup.ts' ],
  transform: {
    '^.+\\.tsx?$': [ 'ts-jest', {
      tsconfig: 'tsconfig.app.json'
    } ]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@graphTypes/(.*)$': '<rootDir>/src/types/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@logic/(.*)$': '<rootDir>/src/logic/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageReporters: [ 'text', 'lcov', 'html' ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ]
}