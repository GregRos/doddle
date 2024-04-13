import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should not call func on empty", () => {
    let i = 0

    aseqs.empty().forEach(() => {
        i++
    })
    expect(i).toBeEqual(0)
})

it("should call func for each element", async () => {
    let i = 0

    await aseqs.of(1, 2, 3).forEach(() => {
        i++
    })
    expect(i).toBeEqual(3)
})
