import { Seq, seq } from "@lib";
import { seqs } from "@lib";
import { expect } from "@assertive-ts/core";
it("should work with empty input", () => {
    const s = seqs.empty().concatMap(x => seqs.of(x, x));
    expect(s.toArray().pull()).toBeEqual([]);
});

it("should work with single element", () => {
    const s = seqs.of(1).concatMap(x => seqs.of(x, x));
    expect(s.toArray().pull()).toBeEqual([1, 1]);
});

it("should work with multiple elements", () => {
    const s = seqs.of(1, 2, 3).concatMap(x => seqs.of(x, x));
    expect(s.toArray().pull()).toBeEqual([1, 1, 2, 2, 3, 3]);
});

it("should work with empty output", () => {
    const s = seqs.of(1, 2, 3).concatMap(x => seqs.empty());
    expect(s.toArray().pull()).toBeEqual([]);
});

test.each([
    ["array", [[1, 1]]],
    ["seq", seq([[1, 1]])],
    ["set", new Set([[1, 1]])],
    ["map", new Map([[1, 1]])]
] as const)("should work with single input and %s output", (_, input) => {
    const s = seqs.of(1).concatMap(x => input);
    expect(s.toArray().pull()).toBeEqual([[1, 1]]);
});
