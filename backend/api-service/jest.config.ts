export default {
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['.*__snapshots__/.*', '.*/index.ts', '.*/openapi.ts', '.*/schemas/.*'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json', 'lcov', 'clover', 'cobertura'],
  moduleNameMapper: {
    '@api/(.*)': '<rootDir>/src/api/$1',
    '@db/(.*)': '<rootDir>/src/db/$1',
    '@helpers/(.*)': '<rootDir>/src/helpers/$1',
    '@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
    '@models/(.*)': '<rootDir>/src/models/$1',
    '@services/(.*)': '<rootDir>/src/services/$1',
    '@tests/(.*)': '<rootDir>/src/tests/$1',
  },
  reporters: ['default'],
  roots: ['<rootDir>'],
  runner: 'groups',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
    '\\.html?$': [
      'esbuild-jest',
      {
        loader: { '.html': 'text' }, // see https://esbuild.github.io/content-types/
      },
    ],
  },
};
