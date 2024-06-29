import { Seq } from "@lib"
function isInt(x: any): x is number {
    return Number.isInteger(x)
}

it("should extract elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3, "a", null] as any[])
    const filtered = seq.extract(isInt)
    filtered satisfies Seq<number>
    expect(filtered.toArray().pull()).toEqual([1, 2, 3])
})

it("should extract all elements from the sequence", () => {
    const seq = Seq.from(["a", "b", "c"] as any[])
    const filtered = seq.extract(isInt)
    filtered satisfies Seq<number>
    expect(filtered.toArray().pull()).toEqual([])
})

it("should extract no elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3] as any[])
    const filtered = seq.extract(isInt)
    filtered satisfies Seq<number>
    expect(filtered.toArray().pull()).toEqual([1, 2, 3])
})
