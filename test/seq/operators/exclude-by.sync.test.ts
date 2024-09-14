import { seq } from "@lib"
const _seq = seq
it("empty stays empty", () => {
    expect(_seq.empty().excludeBy([1], x => 1)._qr).toEqual([])
})

it("elements unchanged if input seq is empty", () => {
    expect(_seq([1, 2, 3]).excludeBy([], x => 1)._qr).toEqual([1, 2, 3])
})

it("removes all elements with constant key projection", () => {
    expect(_seq([1, 2, 3]).excludeBy([1, 2, 3], x => 1)._qr).toEqual([])
})
