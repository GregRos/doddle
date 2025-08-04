import { seq } from "./dist/esm/index.js"

Error.stackTraceLimit = 100
const s = seq([1, 2, 3])
    .each(x => {
        throw new Error()
    })
    .concatMap(x => [x])
    .filter(x => x > 0)
    .each(x => {

    })

for (const x of s) {
    // Drin
}    