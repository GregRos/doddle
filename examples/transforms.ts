import { seq } from "../src"
Error.stackTraceLimit = Infinity
const s = seq
    .of(1, 2, 3)
    .concat(seq.range(0, 100))
    .map(x => x * 2)
    .filter(x => x > 2)
    .flatMap(x => {
        if (x === 30) {
            throw new Error("Hmm")
        }
        return seq.of(x, x + 1)
    })
    .filter(x => x < 40)
    .concat(seq.of(40, 41, 42))
    .take(40)

for (const x of s) {
    console.log(x)
}
