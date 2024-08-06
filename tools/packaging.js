import { echo } from "shelljs"

echo(
    JSON.stringify({
        type: "module"
    })
).to("dist/esm/package.json")

echo(
    JSON.stringify({
        type: "commonjs"
    })
).to("dist/cjs/package.json")
