import { mustBeNatural } from "../../errors/error"

import { seq } from "../seq/seq"

export function sync(start: number, end: number, stepSize = 1) {
    mustBeNatural("stepSize", stepSize)
    const direction = Math.sign(end - start)
    return seq(function* range() {
        for (let i = start; direction * i < direction * end; i += direction * stepSize) {
            yield i
        }
    })
}

export function async(start: number, end: number, stepSize = 1) {
    mustBeNatural("stepSize", stepSize)
    return seq(sync(start, end, stepSize)).aseq()
}
