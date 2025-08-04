import { aseq } from "@lib"
const _seq = aseq

it("joins an empty sequence", async () => {
    await expect(_seq([]).join(",").pull()).resolves.toEqual("")
})

it("joins a sequence with one element", async () => {
    await expect(_seq(["a"]).join(",").pull()).resolves.toEqual("a")
})

it("joins a sequence with multiple elements", async () => {
    await expect(_seq(["a", "b", "c"]).join(",").pull()).resolves.toEqual("a,b,c")
})

it("joins a sequence with a different separator", async () => {
    await expect(_seq(["a", "b", "c"]).join(" - ").pull()).resolves.toEqual("a - b - c")
})

it("joins a sequence with numbers", async () => {
    await expect(_seq([1, 2, 3]).join(",").pull()).resolves.toEqual("1,2,3")
})

it("no side-effects before pull", async () => {
    const mock = jest.fn()
    const seq = _seq(["a", "b", "c"]).map(mock).join(",")
    expect(mock).not.toHaveBeenCalled()

    // now pull and verify mock was called 3×
    await seq.pull()
    expect(mock).toHaveBeenCalledTimes(3)
})

it("handles sequences with undefined or null values", async () => {
    await expect(_seq(["a", null, "b", undefined, "c"]).join(",").pull()).resolves.toEqual(
        "a,,b,,c"
    )
})
