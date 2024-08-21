import { aseq, type ASeq } from "@lib"
import { declare, type, type_of } from "declare-it"
declare.it("generalizes to disjunction correctly", expect => {
    const s = aseq.of(1, "aaa", { hello: "world" })
    expect(type_of(s)).to_equal(type<ASeq<1 | "aaa" | { readonly hello: "world" }>>)
})

it("gives empty on empty argslist", async () => {
    await expect(aseq.of()._qr).resolves.toEqual([])
})

it("gives singleton on singleton argslist", async () => {
    await expect(aseq.of(1)._qr).resolves.toEqual([1])
})

it("gives argslist as is", async () => {
    await expect(aseq.of(1, 2, 3)._qr).resolves.toEqual([1, 2, 3])
})

it("can be called using spread", async () => {
    const args = [1, 2, 3]
    await expect(aseq.of(...args)._qr).resolves.toEqual(args)
})
