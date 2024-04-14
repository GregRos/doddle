import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should take 0 elements from the sequence", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq.take(0).toArray().pull()
    expect(taken).toBeEqual([])
})

it("should take 3 elements from the sequence", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq.take(3).toArray().pull()
    expect(taken).toBeEqual([1, 2, 3])
})

it("should take all elements from the sequence", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq.take(5).toArray().pull()
    expect(taken).toBeEqual([1, 2, 3, 4, 5])
})

it("should take all elements from the sequence if the count is greater than the length", async () => {
    const seq = aseq([1, 2, 3, 4, 5])
    const taken = await seq.take(10).toArray().pull()
    expect(taken).toBeEqual([1, 2, 3, 4, 5])
})

it("should take no elements if the sequence is empty", async () => {
    const seq = aseq([])
    const taken = await seq.take(10).toArray().pull()
    expect(taken).toBeEqual([])
})
