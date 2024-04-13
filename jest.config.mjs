/** @type {import("jest").Config} */
const commons = {
    moduleNameMapper: {
        "^@lib/(.*)$": "<rootDir>/lib/$1",
        "^@lib$": "<rootDir>/lib"
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/test/tsconfig.json",
                transpileOnly: true
            }
        ]
    },
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    collectCoverageFrom: ["<rootDir>/lib/**/*.ts"],
    coverageDirectory: "../../coverage"
};
const config = {
    automock: false,
    preset: "ts-jest",
    projects: [
        {
            displayName: "lazies",
            rootDir: `<rootDir>/packages/lazies`,
            ...commons
        },
        {
            displayName: "seqs",
            rootDir: `<rootDir>/packages/seqs`,
            ...commons
        }
    ],
    rootDir: ".",
    collectCoverage: false
};

export default config;
