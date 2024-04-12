import { Seq, seqs } from "@lib";
import { expect } from "@assertive-ts/core";
it("should do nothing on empty", () => {
    const a = seqs.empty().skip(1);
    expect(a.isEmpty().pull()).toBe(true);
});

it("should skip", () => {
    const a = seqs.of(1, 2, 3).skip(1);
    expect(a.toArray().pull()).toBeEqual([2, 3]);
});
