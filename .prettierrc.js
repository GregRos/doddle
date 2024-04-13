/** @type {import("prettier").Config} */
module.exports = {
    tabWidth: 4,
    filepath:
        "packages/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts,ctsx,mtsx,html,htm,yaml,yml,json,scss,css}",
    arrowParens: "avoid",
    trailingComma: "none",
    printWidth: 100,
    semi: false,
    plugins: [
        "prettier-plugin-organize-imports",
        "prettier-plugin-packagejson",
        "prettier-plugin-jsdoc"
    ]
}
