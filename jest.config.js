export default {
  testEnvironment: "node",

  transform: {},

  testMatch: [
    "**/tests/**/*.test.js"
  ],

  collectCoverageFrom: [
    "controller/**/*.js",
    "!node_modules/**"
  ],

  coverageDirectory: "coverage",

  verbose: true,
};