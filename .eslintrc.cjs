/** @type {import("eslint").Linter.Config} */

module.exports = {
    root: true,
    extends: ["@gregros/eslint-config"],
    parserOptions: {
        project: ["./src/tsconfig.cjs.json", "./src/tsconfig.test.json", "./examples/tsconfig.json"]
    },
    rules: {
        "no-invalid-this": "off",
        "@typescript-eslint/no-namespace": "off",
        // Used a lot in tests as part of test cases with a title
        "@typescript-eslint/ban-ts-comment": "off",
        // Unused vars are needed often in tests
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_+$",
                argsIgnorePattern: "^(_+|expect)$"
            }
        ],
        // lots of empty statements appear in tests
        "no-empty": "off",
        // Explicit control over return types
        "@typescript-eslint/promise-function-async": "off",
        // Explicit control over what generators do
        "require-yield": "off",
        // Don't mess up named functions!
        "prefer-arrow-callback": "off"
    }
}
