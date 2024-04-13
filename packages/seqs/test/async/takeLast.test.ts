it("empty on empty", async () => {
    const a = aseqs.empty().takeLast(1)
    expect(await a.some().pull()).toBe(false)
})

it("should take last", async () => {
    const a = aseqs.of(1, 2, 3).takeLast(1)
    expect(await a.toArray().pull()).toBeEqual([3])
})

it("should take last 2", async () => {
    const a = aseqs.of(1, 2, 3).takeLast(2)
    expect(await a.toArray().pull()).toBeEqual([2, 3])
})

it("should take everything when shorter", async () => {
    const a = aseqs.of(1, 2, 3).takeLast(4)
    expect(await a.toArray().pull()).toBeEqual([1, 2, 3])
})

it("should take nothing when 0", async () => {
    const a = aseqs.of(1, 2, 3).takeLast(0)
    expect(await a.toArray().pull()).toBeEqual([])
})
