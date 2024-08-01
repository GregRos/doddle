const path = require("path")
const projects =
    /** @type {import("eslint").Linter.Config} */
    (
        module.exports = {
            root: true,
            extends: ["@gregros/eslint-config"],
            parserOptions: {
                project: [
                    "./tsconfig.json"
                ]
            },
            rules: {
                "no-invalid-this": "off",
                //disalbe namespace rule:
                "@typescript-eslint/no-namespace": "off"
            }
        }
    )
