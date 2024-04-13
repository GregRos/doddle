import { Seq, seqs } from "@lib";
import { expect } from "@assertive-ts/core";
it("should filter prototypes", () => {
    const stuffs = seqs.of(1, new Map(), new Set());
    const filtered = stuffs.ofTypes(Map);
    expect(filtered.toArray().pull()).toBeEqual([new Map()]);
});

it("should do nothing on empty", () => {
    const stuffs = seqs.empty().ofTypes(Map);
    expect(stuffs.some().pull()).toBe(false);
});

it("should work with Number objects", () => {});
