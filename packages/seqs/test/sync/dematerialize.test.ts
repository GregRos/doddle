import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"
it("empty sequence", () => {
    const s = seqs.empty().dematerialize()
    expect(s.toArray().pull()).toBeEqual([{ value: undefined, done: true }])
})

it("single element", () => {
    const s = seqs.of(1).dematerialize()
    expect(s.toArray().pull()).toBeEqual([
        { value: 1, done: false },
        { value: undefined, done: true }
    ])
})
