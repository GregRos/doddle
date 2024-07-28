import common from "../../jest.root.mjs"

/** @type {import("jest").Config} */
const config = {
    ...common,
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/lib2/tsconfig.json",
                transpileOnly: true
            }
        ]
    },
    testEnvironment: "node",
    testMatch: ["<rootDir>/lib2/**/*.test.ts"],
    collectCoverageFrom: ["<rootDir>/lib2/**/*.ts"]
}

export default config
