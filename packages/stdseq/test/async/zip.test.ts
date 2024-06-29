import { aseqs } from "@lib"

it("should give empty array on empty", async () => {
    const s = await aseqs.empty().toArray().pull()
    expect(s).toEqual([])
})

it("should zip two sequences", async () => {
    const s1 = aseqs.of(1, 2, 3)
    const s2 = aseqs.of("a", "b", "c")
    const zipped = await s1.zip(s2).toArray().pull()
    expect(zipped).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"]
    ])
})

it("should end on shorter sequence", async () => {
    const s1 = aseqs.of(1, 2)
    const s2 = aseqs.of("a", "b", "c")
    const zipped = await s1.zip(s2).toArray().pull()
    expect(zipped).toEqual([
        [1, "a"],
        [2, "b"]
    ])
})

it("should be able to do 5 sequences", async () => {
    const s1 = aseqs.of(1, 2, 3)
    const s2 = aseqs.of("a", "b", "c")
    const s3 = aseqs.of(true, false, true)
    const s4 = aseqs.of(0, 1, 2)
    const s5 = aseqs.of("x", "y", "z")
    const zipped = await s1.zip(s2, s3, s4, s5).toArray().pull()
    expect(zipped).toEqual([
        [1, "a", true, 0, "x"],
        [2, "b", false, 1, "y"],
        [3, "c", true, 2, "z"]
    ])
})
