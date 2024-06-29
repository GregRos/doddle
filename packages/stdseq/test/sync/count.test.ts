import { Seq } from "@lib"

describe("Seq", () => {
    describe("#count", () => {
        it("should return the number of items in the sequence", () => {
            const seq = Seq.from([1, 2, 3, 4, 5])
            const count = seq.count().pull()
            expect(count).toBe(5)
        })

        it("should return 0 for an empty sequence", () => {
            const seq = Seq.from([])
            const count = seq.count().pull()
            expect(count).toBe(0)
        })

        it("should count the number of items that satisfy a predicate", () => {
            const seq = Seq.from([1, 2, 3, 4, 5])
            const count = seq.count(x => x > 3).pull()
            expect(count).toBe(2)
        })
    })
})
