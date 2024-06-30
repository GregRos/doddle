import { seq } from "@lib"

it("should give empty object on empty", () => {
    const s = seq().toObject(x => [x, x])
    expect(s.pull()).toEqual({})
})

it("should convert to object", () => {
    const s = seq.of(1, 2, 3).toObject(x => [x, x])
    expect(s.pull()).toEqual({ 1: 1, 2: 2, 3: 3 })
})

it("should convert to object with different keys", () => {
    const s = seq.of(1, 2, 3).toObject(x => [x + 1, x])
    expect(s.pull()).toEqual({ 2: 1, 3: 2, 4: 3 })
})

it("should keep set newer entry on conflicting", () => {
    const s = seq.of(1, 2, 3).toObject(x => [x % 2, x])
    expect(s.pull()).toEqual({ 1: 3, 0: 2 })
})
