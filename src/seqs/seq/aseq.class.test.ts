import { ASeq } from "@lib"
import { Dummy } from "../from/input.utils.helper"

class CustomSeq extends ASeq<number> {
    override [Symbol.asyncIterator]() {
        return new Dummy._AsyncIterator() as AsyncIterator<number>
    }
}

it("should be async iterable", async () => {
    const seq = new CustomSeq()
    const items = []
    for await (const item of seq) {
        items.push(item)
    }
    expect(items).toEqual([0, 1, 2])
})

it("should support operators", async () => {
    const seq = new CustomSeq().map(x => x + 1).filter(x => x % 2 === 0)
    await expect(seq._qr).resolves.toEqual([2])
})

it("should be accepted by seq.empty() and concat()", async () => {
    const seq = new CustomSeq()
    const result = seq.concat(seq)
    await expect(result._qr).resolves.toEqual([0, 1, 2, 0, 1, 2])
})
