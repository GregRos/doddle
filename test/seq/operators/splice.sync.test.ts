import { seq } from "@lib"

it("splices empty into empty", () => {
    const e = seq([])
    const r = e.splice(0, 0, [])
    expect(r._qr).toEqual([])
})

it("splices by removing all", () => {
    const e = seq([1, 2, 3])
    const r = e.splice(0, 3)
    expect(r._qr).toEqual([])
})

it("splices by removing some", () => {
    const e = seq([1, 2, 3])
    const r = e.splice(1, 1)
    expect(r._qr).toEqual([1, 3])
})

it("splices by inserting some", () => {
    const e = seq([1, 2, 3])
    const r = e.splice(1, 0, [4, 5])
    expect(r._qr).toEqual([1, 4, 5, 2, 3])
})

it("splices by replacing some", () => {
    const e = seq([1, 2, 3])
    const r = e.splice(1, 1, [4, 5])
    expect(r._qr).toEqual([1, 4, 5, 3])
})
