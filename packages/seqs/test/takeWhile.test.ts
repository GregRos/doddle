import { expect } from "@assertive-ts/core"
import { Seq } from "@lib"

it("should take elements from the sequence while the predicate is true", () => {
    const seq = Seq.from([1, 2, 3, 4, 5])
    const taken = seq
        .takeWhile(x => x < 4)
        .toArray()
        .pull()
    expect(taken).toBeEqual([1, 2, 3])
})

it("should take no elements if the predicate is false for the first element", () => {
    const seq = Seq.from([1, 2, 3, 4, 5])
    const taken = seq
        .takeWhile(x => x > 5)
        .toArray()
        .pull()
    expect(taken).toBeEqual([])
})

it("should take all elements if the predicate is true for all elements", () => {
    const seq = Seq.from([1, 2, 3, 4, 5])
    const taken = seq
        .takeWhile(x => x < 6)
        .toArray()
        .pull()
    expect(taken).toBeEqual([1, 2, 3, 4, 5])
})

it("should take no elements if the sequence is empty", () => {
    const seq = Seq.from([])
    const taken = seq
        .takeWhile(x => x < 4)
        .toArray()
        .pull()
    expect(taken).toBeEqual([])
})
