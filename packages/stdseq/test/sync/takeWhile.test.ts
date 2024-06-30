import { seq } from "@lib/sync/seq"

it("should take elements from the sequence while the predicate is true", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq
        .takeWhile(x => x < 4)
        .toArray()
        .pull()
    expect(taken).toEqual([1, 2, 3])
})

it("should take no elements if the predicate is false for the first element", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq
        .takeWhile(x => x > 5)
        .toArray()
        .pull()
    expect(taken).toEqual([])
})

it("should take all elements if the predicate is true for all elements", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq
        .takeWhile(x => x < 6)
        .toArray()
        .pull()
    expect(taken).toEqual([1, 2, 3, 4, 5])
})

it("should take no elements if the sequence is empty", () => {
    const qq = seq([])
    const taken = qq
        .takeWhile(x => x < 4)
        .toArray()
        .pull()
    expect(taken).toEqual([])
})
