import preset from "@gregros/eslint-config"
/** @type {import("eslint").Linter.Config[]} */
export default [
    ...preset,

    {
        rules: {
            "ts/ban-ts-comment": "off",
            // We use named functions for better stack traces
            "prefer-arrow-callback": "off",
            // We often need specific control over generator behavior
            "require-yield": "off",
            // Often need control over how functions behave
            "ts/promise-function-async": "off"
        }
    }
]
