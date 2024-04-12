/** @type {import("mocha").MochaOptions} */
const config = {
    reporter: "spec",
    require: "ts-node/register",
    spec: ["src/test/**/*.test.ts"],
    parallel: true
};
module.exports = config;
