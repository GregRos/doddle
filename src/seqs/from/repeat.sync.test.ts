import { seq } from "../seq/seq.ctor"
it("gives empty for 0 count", () => {
    expect(seq.repeat(0, 1)._qr).toEqual([])
})

it("gives singleton for 1 count", () => {
    expect(seq.repeat(1, 1)._qr).toEqual([1])
})

it("repeats N times", () => {
    expect(seq.repeat(3, 1)._qr).toEqual([1, 1, 1])
})

it("can be called using Infinity", () => {
    const inf = seq.repeat(Infinity, 1).take(1000)
    expect(inf._qr).toEqual(Array(1000).fill(1))
})
