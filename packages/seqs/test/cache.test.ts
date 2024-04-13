import { Seq } from "@lib";
import { seqs } from "@lib";
import { expect } from "@assertive-ts/core";
it("should not mess up seq", () => {
    const s = seqs.of(1, 2, 3).cache();
    expect(s.toArray().pull()).toBeEqual([1, 2, 3]);
});

it("should not show side effects", () => {
    let i = 0;
    const s = seqs
        .of(1, 2, 3)
        .map(x => i++)
        .cache();
    expect(s.toArray().pull()).toBeEqual([0, 1, 2]);
    expect(s.toArray().pull()).toBeEqual([0, 1, 2]);
});
