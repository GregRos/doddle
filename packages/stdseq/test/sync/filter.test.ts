import { seq, type Seq } from "@lib"

it("empty sequence", () => {
    const s = seq.empty().filter(() => false)
    expect(s.toArray().pull()).toEqual([])
})

it("single element", () => {
    const s = seq.of(1).filter(() => true)
    expect(s.toArray().pull()).toEqual([1])
})

it("multiple elements", () => {
    const s = seq.of(1, 2, 3).filter(v => v % 2 === 0)
    expect(s.toArray().pull()).toEqual([2])
})

it("no elements", () => {
    const s = seq.of(1, 2, 3).filter(() => false)
    expect(s.toArray().pull()).toEqual([])
})

it("type predicate", () => {
    const s = seq
        .of(1, 2, 3)
        .as<number | string>()
        .filter(v => typeof v === "number")
    s satisfies Seq<number>
    // @ts-expect-error bounding the type from above
    s satisfies Seq<string>
    expect(s.toArray().pull()).toEqual([1, 2, 3])
})
