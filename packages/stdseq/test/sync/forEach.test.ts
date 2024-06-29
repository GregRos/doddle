import { seqs } from "@lib"

it("should not call func on empty", () => {
    let i = 0

    seqs.empty().forEach(() => {
        i++
    })
    expect(i).toEqual(0)
})

it("should call func for each element", () => {
    let i = 0

    seqs.of(1, 2, 3).forEach(() => {
        i++
    })
    expect(i).toEqual(3)
})
