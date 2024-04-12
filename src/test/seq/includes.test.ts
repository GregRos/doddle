import { Seq, seqs } from "@lib";

it("should not find in empty", () => {
    expect(seqs.empty<number>().includes(1)).toBe(false);
});

it("should find", () => {
    expect(seqs.of(1, 2, 3).includes(2)).toBe(true);
});

it("should not find", () => {
    expect(seqs.of(1, 2, 3).includes(4)).toBe(false);
});
