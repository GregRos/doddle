import { expect } from "@assertive-ts/core"
import { seq } from "@lib"
it("empty are equal", () => {
    const s1 = seq()
    const s2 = seq()
    expect(s1.equals(s2).pull()).toBe(true)
})

it("empty and non-empty are not equal", () => {
    const s1 = seq()
    const s2 = seq.of(1)
    const a = seq.of({ a: 1 })
    const b = seq.of({ b: 1 })
    expect(s1.equals(s2).pull()).toBe(false)
})

it("length 1 are equal", () => {
    const s1 = seq.of(1)
    const s2 = seq.of(1)
    expect(s1.equals(s2).pull()).toBe(true)
})

it("arrays are equal", () => {
    const s1 = seq([1, 2, 3])
    const s2 = seq([1, 2, 3])
    expect(s1.equals(s2).pull()).toBe(true)
})

it("dynamic sequences are equal", () => {
    const s1 = seq(function* () {
        yield 1
        yield 2
        yield 3
    })
    const s2 = seq(function* () {
        yield 1
        yield 2
        yield 3
    })
    expect(s1.equals(s2).pull()).toBe(true)
})

it("different length sequences are not equal", () => {
    const s1 = seq([1, 2, 3])
    const s2 = seq([1, 2])
    expect(s1.equals(s2).pull()).toBe(false)
})

it("a subtype b works", () => {
    const s1 = seq.empty<never>()
    const s2 = seq.empty<number>()
    expect(s1.equals(s2).pull()).toBe(true)
})

it("b subtype a works", () => {
    const s1 = seq.empty<number>()
    const s2 = seq.empty<never>()
    expect(s1.equals(s2).pull()).toBe(true)
})

it("a disjoint b TS error", () => {
    const s1 = seq.empty<number>()
    const s2 = seq.empty<string>()
    // @ts-expect-error Disjoint element types should cause a type error
    expect(s1.equals(s2).pull()).toBe(true)
})
