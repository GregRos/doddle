/** @type {import("jest").Config} */
export default {
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/src/tsconfig.test.json",
                transpileOnly: true
            }
        ]
    },
    moduleNameMapper: {
        "../../index.js": "<rootDir>/dist/cjs/index.js",
        "./utils.js": "<rootDir>/dist/cjs/utils.js"

    },
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/**/*.test.ts"],
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    coverageDirectory: "./coverage",
    collectCoverage: false
}
