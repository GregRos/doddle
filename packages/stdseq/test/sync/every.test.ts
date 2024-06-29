import { seqs } from "@lib"
it("true on empty", () => {
    const s = seqs.empty().every(() => false)
    expect(s.pull()).toBe(true)
})

it("false on once", () => {
    const s = seqs.of(1).every(() => false)
    expect(s.pull()).toBe(false)
})

it("evaluates", () => {
    const s = seqs.of(1, 2, 3).every(v => v < 4)
    expect(s.pull()).toBe(true)
})
