export default {
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['.*__snapshots__/.*', '.*/index.ts', '.*/openapi.ts', '.*/schemas/.*'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json', 'lcov', 'clover', 'cobertura'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@db/(.*)': '<rootDir>/../../common/db/$1',
    '@helpers/(.*)': '<rootDir>/../../common/helpers/$1',
    '@queues/(.*)': '<rootDir>/../../framework/queues/$1',
    '@models/(.*)': '<rootDir>/../../common/models/$1',
    '@services/(.*)': '<rootDir>/../../common/services/$1',
    '@tests/(.*)': '<rootDir>/../../common/tests/$1',
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
