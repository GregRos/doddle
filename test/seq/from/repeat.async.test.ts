import { aseq } from "@lib"
it("gives empty for 0 count", async () => {
    expect(await aseq.repeat(0, 1)._qr).toEqual([])
})

it("gives singleton for 1 count", async () => {
    expect(await aseq.repeat(1, 1)._qr).toEqual([1])
})

it("repeats N times", async () => {
    expect(await aseq.repeat(3, 1)._qr).toEqual([1, 1, 1])
})

it("can be called using Infinity", async () => {
    const inf = aseq.repeat(Infinity, 1).take(1000)
    expect(await inf._qr).toEqual(Array(1000).fill(1))
})
