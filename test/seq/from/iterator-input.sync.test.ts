import { seq, type Seq } from "@lib"
import { declare, type, type_of } from "declare-it"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it("when called with iterator, gives correct type", expect => {
    expect(
        type_of(
            _seq(
                (function* () {
                    yield 1
                })()
            )
        )
    ).to_equal(type<_Seq<number>>)
})

it("calling with iterator caches so that it can be iterated multiple times", () => {
    const s = _seq(
        (function* () {
            yield 1
        })()
    )
    expect(s._qr).toEqual([1])
    expect(s._qr).toEqual([1])
})
