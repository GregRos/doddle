import { expect } from "@assertive-ts/core";
import { Seq, seq, seqs } from "@lib";

it("should give empty object on empty", () => {
    const s = seq().toObject(x => [x, x]);
    expect(s.pull()).toBeEqual({});
});

it("should convert to object", () => {
    const s = seqs.of(1, 2, 3).toObject(x => [x, x]);
    expect(s.pull()).toBeEqual({ 1: 1, 2: 2, 3: 3 });
});

it("should convert to object with different keys", () => {
    const s = seqs.of(1, 2, 3).toObject(x => [x + 1, x]);
    expect(s.pull()).toBeEqual({ 2: 1, 3: 2, 4: 3 });
});

it("should keep previous entry on conflicting", () => {
    const s = seqs.of(1, 2, 3).toObject(x => [x % 2, x]);
    expect(s.pull()).toBeEqual({ 1: 1, 0: 2 });
});
