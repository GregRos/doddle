import { expect } from "@assertive-ts/core";
import { Seq, seq, seqs } from "@lib";

it("should give empty set on empty", () => {
    const s = seq().toSet();
    expect(s.pull()).toBeEqual(new Set());
});

it("should convert to set", () => {
    const s = seqs.of(1, 2, 3).toSet();
    expect(s.pull()).toBeEqual(new Set([1, 2, 3]));
});

it("should remove duplicates", () => {
    const s = seqs.of(1, 2, 2, 3, 3, 3).toSet();
    expect(s.pull()).toBeEqual(new Set([1, 2, 3]));
});
