import preset from "@gregros/eslint-config"
import markdown from "eslint-plugin-markdown"
/** @type {import("eslint").Linter.Config[]} */
export default [
    {
        files: ["*.md"],
        processor: markdown.processors.markdown
    },
    ...preset,

    {
        rules: {
            // We use named functions for better stack traces
            "prefer-arrow-callback": "off",
            // We often need specific control over generator behavior
            "require-yield": "off",
            // Often need control over how functions behave
            "ts/promise-function-async": "off"
        }
    }
]