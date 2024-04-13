it("should share the same iterator across multiple consumers", async () => {
    const s = aseqs.of(1, 2, 3, 4, 5).shared()
    const consumer1 = s.toArray().pull()
    const consumer2 = s.toArray().pull()
    expect(await consumer1).toBeEqual([1, 2, 3, 4, 5])
    expect(await consumer2).toBeEqual([])
})
