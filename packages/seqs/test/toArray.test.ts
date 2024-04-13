import { expect } from "@assertive-ts/core";
import { Seq, seqs } from "@lib";
// Tests for Seq.toArray
it("should convert sequence to array", () => {
    const s = seqs.of(1, 2, 3);
    const array = s.toArray();
    expect(array.pull()).toBeEqual([1, 2, 3]);
});

it("should convert empty sequence to empty array", () => {
    const s = seqs.empty();
    const array = s.toArray();
    expect(array.pull()).toBeEqual([]);
});

it("should convert sequence with one element to array", () => {
    const s = seqs.of(1);
    const array = s.toArray();
    expect(array.pull()).toBeEqual([1]);
});
