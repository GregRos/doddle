import { seq } from "@lib"

it("should take 0 elements from the sequence", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq.take(0).toArray().pull()
    expect(taken).toEqual([])
})

it("should take 3 elements from the sequence", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq.take(3).toArray().pull()
    expect(taken).toEqual([1, 2, 3])
})

it("should take all elements from the sequence", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq.take(5).toArray().pull()
    expect(taken).toEqual([1, 2, 3, 4, 5])
})

it("should take all elements from the sequence if the count is greater than the length", () => {
    const qq = seq([1, 2, 3, 4, 5])
    const taken = qq.take(10).toArray().pull()
    expect(taken).toEqual([1, 2, 3, 4, 5])
})

it("should take no elements if the sequence is empty", () => {
    const qq = seq([])
    const taken = qq.take(10).toArray().pull()
    expect(taken).toEqual([])
})
