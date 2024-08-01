/** @type {import("jest").Config} */
export default {

    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.json",
                transpileOnly: true
            }
        ],
        "^.+\\.test\\.ts$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.test.json",
                transpileOnly: true
            }
        ]
    },
    testEnvironment: "node",
    testMatch: ["<rootDir>/src/**/*.test.ts"],
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    coverageDirectory: "./coverage",
    collectCoverage: false
}


