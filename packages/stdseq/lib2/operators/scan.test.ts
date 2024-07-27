import { declare, type, type_of } from "declare-it"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
// tests scan

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.it("element type is Acc", expect => {
        const s = _seq(null! as string).scan(() => 1, 0)
        expect(type_of(s)).to_equal(type<_Seq<number>>)
    })
    declare.it("can be called with no initial value but the type is T", expect => {
        const s = _seq([""])
        expect(type_of(s.scan(() => "a"))).to_equal(type<_Seq<string>>)
        // @ts-expect-error does not allow a different type
        s.scan(() => 1)
    })

    it("scans with initial value", () => {
        const s = _seq([1, 2, 3]).scan((acc, x) => acc + x, 1)
        expect(s._qr).toEqual([2, 4, 7])
    })

    it("scans without initial value", () => {
        const s = _seq([1, 2, 3]).scan((acc, x) => acc + x)
        expect(s._qr).toEqual([1, 3, 6])
    })

    it("has no side-effects before pull", () => {
        const fn = jest.fn(function* () {})
        const s = _seq(fn).scan(() => 1, 0)
        expect(fn).not.toHaveBeenCalled()
        s._qr
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("works on infinite sequence", () => {
        const s = _seq.repeat(1, Infinity).scan((acc, x) => acc + x, 0)
    })
})
