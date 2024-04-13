import { Seq, seqs } from "@lib";
import { expect } from "@assertive-ts/core";
it("should leave it empty", () => {
    const s = seqs.empty().map(X => 1);
    expect(s.some().pull()).toBe(false);
});

it("should map", () => {
    const s = seqs.of(1, 2, 3).map(v => v + 1);
    expect(s.toArray().pull()).toBeEqual([2, 3, 4]);
});
