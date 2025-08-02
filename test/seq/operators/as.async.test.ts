import { declare, type, type_of } from "declare-it"

import type { ASeq } from "@lib"
import { aseq } from "@lib"
const _seq = aseq
type _Seq<T> = ASeq<T>

declare.it("allows conversion to any type", expect => {
    const s = _seq([1, 2, 3]).as<string>()
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})

it("no-op", async () => {
    const s = _seq([1, 2, 3]).as<number>()
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})
