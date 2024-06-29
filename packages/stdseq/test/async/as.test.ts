import { aseq, ASeq } from "@lib"

it("should do nothing", () => {
    const s = aseq()
    expect(s.as<number>()).toEqual(s)
    s satisfies ASeq<never>
    s.as<number>() satisfies ASeq<number>
    // @ts-expect-error Should be strongly typed
    s.as<number>() satisfies ASeq<string>
})
