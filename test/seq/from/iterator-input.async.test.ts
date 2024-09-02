import { aseq, type ASeq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
type _Seq<T> = ASeq<T>
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

it("calling with iterator caches so that it can be iterated multiple times", async () => {
    const s = _seq(
        (function* () {
            yield 1
        })()
    )
    await expect(s._qr).resolves.toEqual([1])
    await expect(s._qr).resolves.toEqual([1])
})
