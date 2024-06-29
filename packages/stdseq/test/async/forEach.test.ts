import { aseqs } from "@lib"

it("should not call func on empty", async () => {
    let i = 0

    await aseqs.empty().forEach(() => {
        i++
    })
    expect(i).toEqual(0)
})

it("should call func for each element", async () => {
    let i = 0

    await aseqs.of(1, 2, 3).forEach(() => {
        i++
    })
    expect(i).toEqual(3)
})
