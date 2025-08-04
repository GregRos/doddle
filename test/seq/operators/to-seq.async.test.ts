import type { Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { aseq, DoddleAsync } from "@lib"

declare.it("converts a Seq<T> to ASeq<T>", expect => {
    function _<T>() {
        const s = aseq<T>([])
        expect(type_of(s.toSeq())).to_equal(type<DoddleAsync<Seq<T>>>)
    }
})

it("converts a ASeq<T> to Seq<T>", async () => {
    const s = aseq([1, 2, 3])
    await expect(
        s
            .toSeq()
            .map(x => x._qr)
            .pull()
    ).resolves.toEqual([1, 2, 3])
})

it("no side-effects before pull", async () => {
    const fn = jest.fn()
    const s = aseq([1, 2, 3]).each(fn)
    const syncified = s.toSeq()
    expect(fn).toHaveBeenCalledTimes(0)
    await syncified.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})
