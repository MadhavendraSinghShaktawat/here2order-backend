import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "moduleFileExtensions": ["ts", "js"],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testMatch": ["**/*.test.ts"],
  "globals": {
    "ts-jest": {
      "tsconfig": "tsconfig.json"
    }
  }
};

export default config; 