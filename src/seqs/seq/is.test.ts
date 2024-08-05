import { aseq } from "./aseq.ctor"
import { seq } from "./seq.ctor"

it("seq.is returns true for seq", () => {
    expect(seq.is(seq([1, 2, 3]))).toBe(true)
})

it("seq.is returns false for iterable", () => {
    expect(seq.is([1, 2, 3])).toBe(false)
})

it("seq.is returns false for async iterable", () => {
    expect(
        seq.is(
            (async function* () {
                yield 1
            })()
        )
    ).toBe(false)
})

it("seq.is returns false for aseq", () => {
    expect(seq.is(seq([1, 2, 3]).aseq())).toBe(false)
})

it("aseq.is returns false for seq", () => {
    expect(aseq.is(seq([1, 2, 3]))).toBe(false)
})

it("aseq.is returns false for iterable", () => {
    expect(aseq.is([1, 2, 3])).toBe(false)
})

it("aseq.is returns false for async iterable", () => {
    expect(
        aseq.is(
            (async function* () {
                yield 1
            })()
        )
    ).toBe(false)
})

it("aseq.is returns true for aseq", () => {
    expect(aseq.is(seq([1, 2, 3]).aseq())).toBe(true)
})
