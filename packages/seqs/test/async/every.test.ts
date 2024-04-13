it("true on empty", async () => {
    const s = aseqs.empty().every(async () => false)
    expect(await s.pull()).toBe(true)
})

it("false on once", async () => {
    const s = aseqs.of(1).every(async () => false)
    expect(await s.pull()).toBe(false)
})

it("evaluates", async () => {
    const s = aseqs.of(1, 2, 3).every(async v => v < 4)
    expect(await s.pull()).toBe(true)
})
