import { expect } from "@assertive-ts/core"
import { aseq } from "@lib"

it("should take elements from the sequence while the predicate is true", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq
        .takeWhile(async x => x < 4)
        .toArray()
        .pull()
    expect(taken).toBeEqual([1, 2, 3])
})

it("should take no elements if the predicate is false for the first element", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq
        .takeWhile(async x => x > 5)
        .toArray()
        .pull()
    expect(taken).toBeEqual([])
})

it("should take all elements if the predicate is true for all elements", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq
        .takeWhile(async x => x < 6)
        .toArray()
        .pull()
    expect(taken).toBeEqual([1, 2, 3, 4, 5])
})

it("should take no elements if the sequence is empty", async () => {
    const seq = aseq([])
    const taken = await seq
        .takeWhile(async x => x < 4)
        .toArray()
        .pull()
    expect(taken).toBeEqual([])
})
