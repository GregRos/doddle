import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

it("joins an empty sequence", () => {
    const s = _seq([]).join(",").pull()
    expect(s).toEqual("")
})

it("joins a sequence with one element", () => {
    const s = _seq(["a"]).join(",").pull()
    expect(s).toEqual("a")
})

it("joins a sequence with multiple elements", () => {
    const s = _seq(["a", "b", "c"]).join(",").pull()
    expect(s).toEqual("a,b,c")
})

it("joins a sequence with a different separator", () => {
    const s = _seq(["a", "b", "c"]).join(" - ").pull()
    expect(s).toEqual("a - b - c")
})

it("joins a sequence with numbers", () => {
    const s = _seq([1, 2, 3]).join(",").pull()
    expect(s).toEqual("1,2,3")
})

it("no side-effects before pull", () => {
    const mock = jest.fn()
    const s = _seq(["a", "b", "c"]).map(mock).join(",")
    expect(mock).not.toHaveBeenCalled()
    s.pull()
    expect(mock).toHaveBeenCalledTimes(3)
})

it("handles sequences with undefined or null values", () => {
    const s = _seq(["a", null, "b", undefined, "c"]).join(",").pull()
    expect(s).toEqual("a,,b,,c")
})
