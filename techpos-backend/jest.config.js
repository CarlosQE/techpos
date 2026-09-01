module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testRegex: '.*\\.spec\\.ts$',
  setupFiles: ['reflect-metadata'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
