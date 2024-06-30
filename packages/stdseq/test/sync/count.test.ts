import { seq } from "@lib"

describe("Seq", () => {
    describe("#count", () => {
        it("should return the number of items in the sequence", () => {
            const qq = seq([1, 2, 3, 4, 5])
            const count = qq.count().pull()
            expect(count).toBe(5)
        })

        it("should return 0 for an empty sequence", () => {
            const qq = seq([])
            const count = qq.count().pull()
            expect(count).toBe(0)
        })

        it("should count the number of items that satisfy a predicate", () => {
            const qq = seq([1, 2, 3, 4, 5])
            const count = qq.count(x => x > 3).pull()
            expect(count).toBe(2)
        })
    })
})
