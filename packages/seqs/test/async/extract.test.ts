import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

function isInt(x: any): x is number {
    return Number.isInteger(x)
}

it("should extract elements from the sequence", async () => {
    const seq = aseq([1, 2, 3, "a", null] as any[])
    const filtered = seq.extract(isInt)
    filtered satisfies ASeq<number>
    expect(await filtered.toArray().pull()).toBeEqual([1, 2, 3])
})

it("should extract all elements from the sequence", async () => {
    const seq = aseq(["a", "b", "c"] as any[])
    const filtered = seq.extract(isInt)
    filtered satisfies ASeq<number>
    expect(await filtered.toArray().pull()).toBeEqual([])
})

it("should extract no elements from the sequence", async () => {
    const seq = aseq([1, 2, 3] as any[])
    const filtered = seq.extract(isInt)
    filtered satisfies ASeq<number>
    expect(await filtered.toArray().pull()).toBeEqual([1, 2, 3])
})
