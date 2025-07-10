import { seq, Seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

it("gives empty on empty", () => {
    const s = _seq([]).share()
    expect(s.toArray().pull()).toEqual([])
})

it("gives same elements", () => {
    const s = _seq([1, 2, 3]).share()
    expect(s.toArray().pull()).toEqual([1, 2, 3])
})

it("iterates twice but second time is empty", () => {
    const s = _seq([1, 2, 3]).share()
    expect(s.toArray().pull()).toEqual([1, 2, 3])
    expect(s.toArray().pull()).toEqual([])
})

it("iterates partially twice with a break", () => {
    const s = _seq([1, 2, 3]).share()
    expect(s.take(1).toArray().pull()).toEqual([1])
    expect(s.toArray().pull()).toEqual([2, 3])
})

it("fails on circular reference", () => {
    const iterable = {
        [Symbol.iterator]: function* () {
            yield 1
            yield* shared
        }
    } as Iterable<number>
    const shared = _seq(iterable).share()
    expect(() => {
        return shared._qr
    }).toThrow()
})
