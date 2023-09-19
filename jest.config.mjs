/** @type {import("jest").Config} */
const config = {
    automock: false,
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir:".",
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

export default config
