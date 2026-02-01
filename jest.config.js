const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  collectCoverageFrom: [
    "src/lib/**/*.{js,jsx,ts,tsx}",
    "src/hooks/**/*.{js,jsx,ts,tsx}",
    "!src/lib/**/*.d.ts",
    "!src/lib/__tests__/**",
  ],
  transformIgnorePatterns: ["node_modules/(?!(nanoid)/)"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
