import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  projects: [
    {
      displayName: 'Unit',
      moduleFileExtensions: ['js', 'json', 'ts'],
      testRegex: '.*\\.spec\\.ts$',
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      testEnvironment: 'node',
      rootDir: './test',
    },
  ],
};
export default config;
