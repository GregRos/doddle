import { expect } from "@assertive-ts/core"
import { Seq } from "@lib"

function isInt(x: any): x is number {
    return Number.isInteger(x)
}

it("should exclude elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3, 4, 5, "a", "b"])
    const excluded = seq.exclude(isInt)
    expect(excluded.toArray().pull()).toBeEqual(["a", "b"])
})

it("should exclude all elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3] as any[])
    const excluded = seq.exclude(isInt)
    expect(excluded.toArray().pull()).toBeEqual([])
})

it("should exclude no elements from the sequence", () => {
    const seq = Seq.from(["a", "b", "c"] as any[])
    const excluded = seq.exclude(isInt)
    expect(excluded.toArray().pull()).toBeEqual(["a", "b", "c"])
})
