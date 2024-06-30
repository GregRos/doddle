import { aseq } from "@lib"

it("empty sequence", async () => {
    const s = aseq.empty().dematerialize()
    expect(await s.toArray().pull()).toEqual([{ value: undefined, done: true }])
})

it("single element", async () => {
    const s = aseq.of(1).dematerialize()
    expect(await s.toArray().pull()).toEqual([
        { value: 1, done: false },
        { value: undefined, done: true }
    ])
})
