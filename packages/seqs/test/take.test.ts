import { expect } from "@assertive-ts/core";
import { Seq } from "@lib";

it("should take 0 elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3, 4, 5]);
    const taken = seq.take(0).toArray().pull();
    expect(taken).toBeEqual([]);
});

it("should take 3 elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3, 4, 5]);
    const taken = seq.take(3).toArray().pull();
    expect(taken).toBeEqual([1, 2, 3]);
});

it("should take all elements from the sequence", () => {
    const seq = Seq.from([1, 2, 3, 4, 5]);
    const taken = seq.take(5).toArray().pull();
    expect(taken).toBeEqual([1, 2, 3, 4, 5]);
});

it("should take all elements from the sequence if the count is greater than the length", () => {
    const seq = Seq.from([1, 2, 3, 4, 5]);
    const taken = seq.take(10).toArray().pull();
    expect(taken).toBeEqual([1, 2, 3, 4, 5]);
});

it("should take no elements if the sequence is empty", () => {
    const seq = Seq.from([]);
    const taken = seq.take(10).toArray().pull();
    expect(taken).toBeEqual([]);
});
