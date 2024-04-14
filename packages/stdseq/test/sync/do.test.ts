import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"
it("nothing on empty", () => {
    let i = 0

    const s = seqs
        .empty()
        .do(() => {
            i++
        })
        .toArray()
        .pull()
    expect(i).toBeEqual(0)
})
it("once per element", () => {
    let i = 0
    const s = seqs
        .of(1, 2, 3)
        .do(() => {
            i++
        })
        .toArray()
        .pull()
    expect(i).toBeEqual(3)
})
