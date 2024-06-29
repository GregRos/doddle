import { aseqs } from "@lib"

it("nothing on empty", async () => {
    let i = 0

    const s = aseqs
        .empty()
        .do(async () => {
            i++
        })
        .toArray()
        .pull()
    expect(await s).toEqual([])
    expect(i).toEqual(0)
})

it("once per element", async () => {
    let i = 0
    const s = aseqs
        .of(1, 2, 3)
        .do(async () => {
            i++
        })
        .toArray()
        .pull()
    expect(await s).toEqual([1, 2, 3])
    expect(i).toEqual(3)
})
