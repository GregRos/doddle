import { seq, type Seq } from "@lib"
import { declare, type, type_of } from "declare-it"
declare.it("generalizes to disjunction correctly", expect => {
    const s = seq.of(1, "aaa", { hello: "world" })
    expect(type_of(s)).to_equal(type<Seq<1 | "aaa" | { readonly hello: "world" }>>)
})
it("gives empty on empty argslist", () => {
    expect(seq.of()._qr).toEqual([])
})

it("gives singleton on singleton argslist", () => {
    expect(seq.of(1)._qr).toEqual([1])
})

it("gives argslist as is", () => {
    expect(seq.of(1, 2, 3)._qr).toEqual([1, 2, 3])
})

it("can be called using spread", () => {
    const args = [1, 2, 3]
    expect(seq.of(...args)._qr).toEqual(args)
})
