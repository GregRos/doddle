import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"
it("should default on empty", () => {
    expect(
        seqs
            .empty()
            .reduce((a, b) => a + b, 0)
            .pull()
    ).toBeEqual(0)
})

it("should reduce", () => {
    expect(
        seqs
            .of(1, 2, 3)
            .reduce((a, b) => a + b, 0)
            .pull()
    ).toBeEqual(6)
})
