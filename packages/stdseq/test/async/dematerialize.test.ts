import { aseqs } from "@lib"

it("empty sequence", async () => {
    const s = aseqs.empty().dematerialize()
    expect(await s.toArray().pull()).toEqual([{ value: undefined, done: true }])
})

it("single element", async () => {
    const s = aseqs.of(1).dematerialize()
    expect(await s.toArray().pull()).toEqual([
        { value: 1, done: false },
        { value: undefined, done: true }
    ])
})
