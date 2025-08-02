import { Seq } from "@lib"
import { Dummy } from "./from/input.utils.helper"

class CustomSeq extends Seq<number> {
    override [Symbol.iterator]() {
        return new Dummy._Iterator() as Iterator<number>
    }
}

it("should be iterable", () => {
    const seq = new CustomSeq()
    expect([...seq]).toEqual([0, 1, 2])
})

it("should support operators", () => {
    const seq = new CustomSeq().map(x => x + 1).filter(x => x % 2 === 0)
    expect([...seq]).toEqual([2])
})

it("should be accepted by seq([]) and concat()", () => {
    const seq = new CustomSeq()
    const result = seq.concat(seq)
    expect([...result]).toEqual([0, 1, 2, 0, 1, 2])
})
