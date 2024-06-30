import { seq } from "@lib"
it("empty sequence", () => {
    const s = seq.empty().dematerialize()
    expect(s.toArray().pull()).toEqual([{ value: undefined, done: true }])
})

it("single element", () => {
    const s = seq.of(1).dematerialize()
    expect(s.toArray().pull()).toEqual([
        { value: 1, done: false },
        { value: undefined, done: true }
    ])
})
