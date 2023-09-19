export default {
    automock: false,
    preset: "ts-jest",
    rootDir: import.meta.url.replace(/^file:\/\/\/(.*)\/jest.config.mjs$/, "$1"),
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/test/**/*.ts"],
    // The default test threshold is 5s. That's way too low.
    slowTestThreshold: 500,

    // Should be set via --coverage option
    collectCoverage: false,
    collectCoverageFrom: ["<rootDir>/src/lib/**/*.ts"],
    coverageDirectory: "<rootDir>/coverage",
    forceExit: true,
    moduleNameMapper: {
        "^@lib/(.*)$": "<rootDir>/src/lib/$1",
        "^@lib$": "<rootDir>/src/lib"
    },
    globals: {
        defaults: {}
    },
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {
            tsconfig: "src/test/tsconfig.json",
            transpileOnly: true
        }]
    }
};
