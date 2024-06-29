import { seqs } from "@lib"

it("should give empty array on empty", () => {
    const s = seqs.empty().toArray()
    expect(s.pull()).toEqual([])
})
it("should zip two sequences", () => {
    const s1 = seqs.of(1, 2, 3)
    const s2 = seqs.of("a", "b", "c")
    const zipped = s1.zip(s2)
    expect(zipped.toArray().pull()).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"]
    ])
})

it("should end on shorter sequence", () => {
    const s1 = seqs.of(1, 2)
    const s2 = seqs.of("a", "b", "c")
    const zipped = s1.zip(s2)
    expect(zipped.toArray().pull()).toEqual([
        [1, "a"],
        [2, "b"]
    ])
})

it("should be able to do 5 sequences", () => {
    const s1 = seqs.of(1, 2, 3)
    const s2 = seqs.of("a", "b", "c")
    const s3 = seqs.of(true, false, true)
    const s4 = seqs.of(0, 1, 2)
    const s5 = seqs.of("x", "y", "z")
    const zipped = s1.zip(s2, s3, s4, s5)
    expect(zipped.toArray().pull()).toEqual([
        [1, "a", true, 0, "x"],
        [2, "b", false, 1, "y"],
        [3, "c", true, 2, "z"]
    ])
})
