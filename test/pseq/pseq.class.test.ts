import { PSeq } from "@lib"
import { matrix } from "./matrix.helper"

describe("PSeq", () => {
    it("flattens nested async iterables based on earliest emissions", async () => {
        const diagram = `
~~|-1--2--
~~~~~~|-1--1
~~~~~~~~|-1
`
        const source = matrix(diagram)
        const seq = new PSeq(source)
        const result: number[] = []
        for await (const x of seq) {
            result.push(x)
        }
        expect(result).toEqual([1, 2, 1, 1, 1])
    })
})
