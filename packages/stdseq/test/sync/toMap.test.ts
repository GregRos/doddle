import { seq, seqs } from "@lib"

// Tests for Seq.toMap
it("should give empty map on empty", () => {
    const s = seq().toMap(x => [x, x])
    expect(s.pull()).toEqual(new Map<never, never>())
})

it("should convert to map", () => {
    const s = seqs.of(1, 2, 3).toMap(x => [x, x])
    expect(s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("should convert to map with different keys", () => {
    const s = seqs.of(1, 2, 3).toMap(x => [x + 1, x])
    expect(s.pull()).toEqual(
        new Map([
            [2, 1],
            [3, 2],
            [4, 3]
        ])
    )
})

it("should replace old key on conflicting", () => {
    const s = seqs.of(1, 2, 3).toMap(x => [x % 2, x])
    expect(s.pull()).toEqual(
        new Map([
            [0, 2],
            [1, 3]
        ])
    )
})
