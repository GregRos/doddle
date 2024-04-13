import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"
it("get at 0", () => {
    const s = seqs.of(1, 2, 3)
    expect(s.at(0).pull()).toBeEqual(1)
})

it("get at number", () => {
    const s = seqs.of(1, 2, 3)
    expect(s.at(1).pull()).toBeEqual(2)
})

it("get at missing index is undefined", () => {
    const s = seqs.of(1, 2, 3)
    expect(s.at(3).pull()).toBeNull()
})

it("get at negative index", () => {
    const s = seqs.of(1, 2, 3)
    expect(s.at(-1).pull()).toBeEqual(3)
})
