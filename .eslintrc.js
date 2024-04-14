const path = require("path")
const projects = ["stdlazy", "stdseq"].flatMap(pkg =>
    ["lib", "test"].map(dir => path.join(__dirname, "packages", pkg, dir, "tsconfig.json"))
)
/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["@gregros/eslint-config"],
    parserOptions: {
        project: projects
    },
    rules: {
        "no-invalid-this": "off",
        //disalbe namespace rule:
        "@typescript-eslint/no-namespace": "off"
    }
}
