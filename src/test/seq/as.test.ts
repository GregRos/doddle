import { Seq, seq } from "@lib";

it("should do nothing", () => {
    const s = seq();
    expect(s.as<number>()).toBe(s);
    s satisfies Seq<never>;
    s.as<number>() satisfies Seq<number>;
    // @ts-expect-error
    s.as<number>() satisfies Seq<string>;
});
