import { mustBeNatural } from "../errors/error"
import { seq } from "../seq"
import { fromSyncInput } from "./input"

export function sync(start: number, end: number, stepSize = 1) {
    mustBeNatural("stepSize", start)
    const direction = Math.sign(end - start)
    return seq(function* range() {
        for (let i = start; direction * i < direction * end; i += direction * stepSize) {
            yield i
        }
    })
}

export function async(start: number, end: number, stepSize = 1) {
    mustBeNatural("stepSize", start)
    return seq(sync(start, end, stepSize)).aseq()
}
