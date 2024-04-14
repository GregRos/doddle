import { seq, seqs } from "@lib"
import { expect } from "@assertive-ts/core"
describe("as", () => {
    it("should do nothing", () => {
        const s = seq()
        expect(s.as<number>()).toBeEqual(s)
        s satisfies Seq<never>
        s.as<number>() satisfies Seq<number>
        // @ts-expect-error Should be strongly typed
        s.as<number>() satisfies Seq<string>
    })
})
describe("at", () => {
    it("get at 0", () => {
        const s = seqs.of(1, 2, 3)
        expect(s.at(0).pull()).toBeEqual(1)
    })

    it("get at number", () => {
        const s = seqs.of(1, 2, 3)
        expect(s.at(1).pull()).toBeEqual(2)
    })

    it("get at missing index is undefined", () => {
        const s = seqs.of(1, 2, 3)
        expect(s.at(3).pull()).toBeNull()
    })

    it("get at negative index", () => {
        const s = seqs.of(1, 2, 3)
        expect(s.at(-1).pull()).toBeEqual(3)
    })
})
describe("cache", () => {
    it("should not mess up seq", () => {
        const s = seqs.of(1, 2, 3).cache()
        expect(s.toArray().pull()).toBeEqual([1, 2, 3])
    })

    it("should not show side effects", () => {
        let i = 0
        const s = seqs
            .of(1, 2, 3)
            .map(x => i++)
            .cache()
        expect(s.toArray().pull()).toBeEqual([0, 1, 2])
        expect(s.toArray().pull()).toBeEqual([0, 1, 2])
    })
})
describe("concatMap", () => {
    it("should work with empty input", () => {
        const s = seqs.empty().concatMap(x => seqs.of(x, x))
        expect(s.toArray().pull()).toBeEqual([])
    })

    it("should work with single element", () => {
        const s = seqs.of(1).concatMap(x => seqs.of(x, x))
        expect(s.toArray().pull()).toBeEqual([1, 1])
    })

    it("should work with multiple elements", () => {
        const s = seqs.of(1, 2, 3).concatMap(x => seqs.of(x, x))
        expect(s.toArray().pull()).toBeEqual([1, 1, 2, 2, 3, 3])
    })

    it("should work with empty output", () => {
        const s = seqs.of(1, 2, 3).concatMap(x => seqs.empty())
        expect(s.toArray().pull()).toBeEqual([])
    })

    test.each([
        ["array", [[1, 1]]],
        ["seq", seq([[1, 1]])],
        ["set", new Set([[1, 1]])],
        ["map", new Map([[1, 1]])]
    ] as const)("should work with single input and %s output", (_, input) => {
        const s = seqs.of(1).concatMap(x => input)
        expect(s.toArray().pull()).toBeEqual([[1, 1]])
    })
})
describe("count", () => {
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
})
describe("dematerialize", () => {
    it("empty sequence", () => {
        const s = seqs.empty().dematerialize()
        expect(s.toArray().pull()).toBeEqual([{ value: undefined, done: true }])
    })

    it("single element", () => {
        const s = seqs.of(1).dematerialize()
        expect(s.toArray().pull()).toBeEqual([
            { value: 1, done: false },
            { value: undefined, done: true }
        ])
    })
})
describe("do", () => {
    it("nothing on empty", () => {
        let i = 0

        const s = seqs
            .empty()
            .do(() => {
                i++
            })
            .toArray()
            .pull()
        expect(i).toBeEqual(0)
    })
    it("once per element", () => {
        let i = 0
        const s = seqs
            .of(1, 2, 3)
            .do(() => {
                i++
            })
            .toArray()
            .pull()
        expect(i).toBeEqual(3)
    })
})
describe("every", () => {
    it("true on empty", () => {
        const s = seqs.empty().every(() => false)
        expect(s.pull()).toBe(true)
    })

    it("false on once", () => {
        const s = seqs.of(1).every(() => false)
        expect(s.pull()).toBe(false)
    })

    it("evaluates", () => {
        const s = seqs.of(1, 2, 3).every(v => v < 4)
        expect(s.pull()).toBe(true)
    })
})
describe("exclude", () => {
    function isInt(x: any): x is number {
        return Number.isInteger(x)
    }

    it("should exclude elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3, 4, 5, "a", "b"])
        const excluded = seq.exclude(isInt)
        expect(excluded.toArray().pull()).toBeEqual(["a", "b"])
    })

    it("should exclude all elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3] as any[])
        const excluded = seq.exclude(isInt)
        expect(excluded.toArray().pull()).toBeEqual([])
    })

    it("should exclude no elements from the sequence", () => {
        const seq = Seq.from(["a", "b", "c"] as any[])
        const excluded = seq.exclude(isInt)
        expect(excluded.toArray().pull()).toBeEqual(["a", "b", "c"])
    })
})
describe("extract", () => {
    function isInt(x: any): x is number {
        return Number.isInteger(x)
    }

    it("should extract elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3, "a", null] as any[])
        const filtered = seq.extract(isInt)
        filtered satisfies Seq<number>
        expect(filtered.toArray().pull()).toBeEqual([1, 2, 3])
    })

    it("should extract all elements from the sequence", () => {
        const seq = Seq.from(["a", "b", "c"] as any[])
        const filtered = seq.extract(isInt)
        filtered satisfies Seq<number>
        expect(filtered.toArray().pull()).toBeEqual([])
    })

    it("should extract no elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3] as any[])
        const filtered = seq.extract(isInt)
        filtered satisfies Seq<number>
        expect(filtered.toArray().pull()).toBeEqual([1, 2, 3])
    })
})
describe("filter", () => {
    it("empty sequence", () => {
        const s = seqs.empty().filter(() => false)
        expect(s.toArray().pull()).toBeEqual([])
    })

    it("single element", () => {
        const s = seqs.of(1).filter(() => true)
        expect(s.toArray().pull()).toBeEqual([1])
    })

    it("multiple elements", () => {
        const s = seqs.of(1, 2, 3).filter(v => v % 2 === 0)
        expect(s.toArray().pull()).toBeEqual([2])
    })

    it("no elements", () => {
        const s = seqs.of(1, 2, 3).filter(() => false)
        expect(s.toArray().pull()).toBeEqual([])
    })
})
describe("first", () => {
    it("should return null for empty", () => {
        expect(seqs.empty().first().pull()).toBe(null)
    })

    it("accepts default value", () => {
        expect(seqs.empty().first(1).pull()).toBe(1)
    })

    it("should return first element", () => {
        expect(seqs.of(1, 2, 3).first().pull()).toBe(1)
    })
})
describe("forEach", () => {
    it("should not call func on empty", () => {
        let i = 0

        seqs.empty().forEach(() => {
            i++
        })
        expect(i).toBeEqual(0)
    })

    it("should call func for each element", () => {
        let i = 0

        seqs.of(1, 2, 3).forEach(() => {
            i++
        })
        expect(i).toBeEqual(3)
    })
})
describe("from", () => {
    it("should work correctly", () => {
        // TODO: Write tests for from
    })
})
describe("includes", () => {
    it("should not find in empty", () => {
        expect(seqs.empty<number>().includes(1).pull()).toBe(false)
    })

    it("should find", () => {
        expect(seqs.of(1, 2, 3).includes(2).pull()).toBe(true)
    })

    it("should not find", () => {
        expect(seqs.of(1, 2, 3).includes(4).pull()).toBe(false)
    })
})
describe("index", () => {
    it("should do nothing on empty", () => {
        const a = seqs.empty().index()
        expect(a.some().pull()).toBe(false)
    })

    it("should attach index", () => {
        const a = seqs.of(1, 2, 3).index()
        expect(a.toArray().pull()).toBeEqual([
            [0, 1],
            [1, 2],
            [2, 3]
        ])
    })
})
describe("last", () => {
    it("should return null for empty", () => {
        expect(seqs.empty().first().pull()).toBe(null)
    })

    it("accepts default value", () => {
        expect(seqs.empty().first(1).pull()).toBe(1)
    })

    it("should return first element", () => {
        expect(seqs.of(3, 2, 3).first().pull()).toBe(3)
    })
})
describe("map", () => {
    it("should leave it empty", () => {
        const s = seqs.empty().map(X => 1)
        expect(s.some().pull()).toBe(false)
    })

    it("should map", () => {
        const s = seqs.of(1, 2, 3).map(v => v + 1)
        expect(s.toArray().pull()).toBeEqual([2, 3, 4])
    })
})
describe("ofTypes", () => {
    it("should filter prototypes", () => {
        const stuffs = seqs.of(1, new Map(), new Set())
        const filtered = stuffs.extractTypes(Map)
        expect(filtered.toArray().pull()).toBeEqual([new Map()])
    })

    it("should do nothing on empty", () => {
        const stuffs = seqs.empty().extractTypes(Map)
        expect(stuffs.some().pull()).toBe(false)
    })

    it("should work with Number objects", () => {})
})
describe("reduce", () => {
    it("should default on empty", () => {
        expect(
            seqs
                .empty()
                .reduce((a, b) => a + b, 0)
                .pull()
        ).toBeEqual(0)
    })

    it("should reduce", () => {
        expect(
            seqs
                .of(1, 2, 3)
                .reduce((a, b) => a + b, 0)
                .pull()
        ).toBeEqual(6)
    })
})
describe("skip", () => {
    it("should do nothing on empty", () => {
        const a = seqs.empty().skip(1)
        expect(a.some().pull()).toBeEqual(false)
    })

    it("should skip", () => {
        const a = seqs.of(1, 2, 3).skip(1)
        expect(a.toArray().pull()).toBeEqual([2, 3])
    })

    it("should skip all", () => {
        const a = seqs.of(1, 2, 3).skip(3)
        expect(a.toArray().pull()).toBeEqual([])
    })

    it("should skip more than all", () => {
        const a = seqs.of(1, 2, 3).skip(4)
        expect(a.toArray().pull()).toBeEqual([])
    })
})
describe("skipLast", () => {
    it("should empty on empty", () => {
        const a = seqs.empty().skipLast(1)
        expect(a.some().pull()).toBe(false)
    })

    it("should skip last", () => {
        const a = seqs.of(1, 2, 3).skipLast(1)
        expect(a.toArray().pull()).toBeEqual([1, 2])
    })

    it("should skip last 2", () => {
        const a = seqs.of(1, 2, 3).skipLast(2)
        expect(a.toArray().pull()).toBeEqual([1])
    })

    it("should skip everything when shorter", () => {
        const a = seqs.of(1, 2, 3).skipLast(4)
        expect(a.toArray().pull()).toBeEqual([])
    })

    it("should skip nothing when 0", () => {
        const a = seqs.of(1, 2, 3).skipLast(0)
        expect(a.toArray().pull()).toBeEqual([1, 2, 3])
    })
})
describe("some", () => {
    describe("no predicate", () => {
        it("gives false if empty", () => {
            expect(seqs.empty<number>().some().pull()).toBeEqual(false)
        })

        it("gives true if single element", () => {
            expect(seqs.of(1).some().pull()).toBeEqual(true)
        })
    })
    describe("predicate", () => {
        it("gives false if empty", () => {
            expect(
                seqs
                    .empty<number>()
                    .some(() => true)
                    .pull()
            ).toBeEqual(false)
        })

        it("gives true if single element", () => {
            expect(
                seqs
                    .of(1)
                    .some(() => true)
                    .pull()
            ).toBeEqual(true)
        })

        it("gives false if predicate is false", () => {
            expect(
                seqs
                    .of(1)
                    .some(() => false)
                    .pull()
            ).toBeEqual(false)
        })

        it("gives true if predicate is true", () => {
            expect(
                seqs
                    .of(1)
                    .some(() => true)
                    .pull()
            ).toBeEqual(true)
        })

        it("gives true if predicate is true for some", () => {
            expect(
                seqs
                    .of(1, 2, 3)
                    .some(v => v === 2)
                    .pull()
            ).toBeEqual(true)
        })

        it("gives false if predicate is false for all", () => {
            expect(
                seqs
                    .of(1, 2, 3)
                    .some(v => v === 4)
                    .pull()
            ).toBeEqual(false)
        })
    })
})
describe("take", () => {
    it("should take 0 elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq.take(0).toArray().pull()
        expect(taken).toBeEqual([])
    })

    it("should take 3 elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq.take(3).toArray().pull()
        expect(taken).toBeEqual([1, 2, 3])
    })

    it("should take all elements from the sequence", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq.take(5).toArray().pull()
        expect(taken).toBeEqual([1, 2, 3, 4, 5])
    })

    it("should take all elements from the sequence if the count is greater than the length", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq.take(10).toArray().pull()
        expect(taken).toBeEqual([1, 2, 3, 4, 5])
    })

    it("should take no elements if the sequence is empty", () => {
        const seq = Seq.from([])
        const taken = seq.take(10).toArray().pull()
        expect(taken).toBeEqual([])
    })
})
describe("takeLast", () => {
    it("empty on empty", () => {
        const a = seqs.empty().takeLast(1)
        expect(a.some().pull()).toBe(false)
    })

    it("should take last", () => {
        const a = seqs.of(1, 2, 3).takeLast(1)
        expect(a.toArray().pull()).toBeEqual([3])
    })

    it("should take last 2", () => {
        const a = seqs.of(1, 2, 3).takeLast(2)
        expect(a.toArray().pull()).toBeEqual([2, 3])
    })

    it("should take everything when shorter", () => {
        const a = seqs.of(1, 2, 3).takeLast(4)
        expect(a.toArray().pull()).toBeEqual([1, 2, 3])
    })

    it("should take nothing when 0", () => {
        const a = seqs.of(1, 2, 3).takeLast(0)
        expect(a.toArray().pull()).toBeEqual([])
    })
})
describe("takeWhile", () => {
    it("should take elements from the sequence while the predicate is true", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq
            .takeWhile(x => x < 4)
            .toArray()
            .pull()
        expect(taken).toBeEqual([1, 2, 3])
    })

    it("should take no elements if the predicate is false for the first element", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq
            .takeWhile(x => x > 5)
            .toArray()
            .pull()
        expect(taken).toBeEqual([])
    })

    it("should take all elements if the predicate is true for all elements", () => {
        const seq = Seq.from([1, 2, 3, 4, 5])
        const taken = seq
            .takeWhile(x => x < 6)
            .toArray()
            .pull()
        expect(taken).toBeEqual([1, 2, 3, 4, 5])
    })

    it("should take no elements if the sequence is empty", () => {
        const seq = Seq.from([])
        const taken = seq
            .takeWhile(x => x < 4)
            .toArray()
            .pull()
        expect(taken).toBeEqual([])
    })
})
describe("toArray", () => {
    // Tests for Seq.toArray
    it("should convert sequence to array", () => {
        const s = seqs.of(1, 2, 3)
        const array = s.toArray()
        expect(array.pull()).toBeEqual([1, 2, 3])
    })

    it("should convert empty sequence to empty array", () => {
        const s = seqs.empty()
        const array = s.toArray()
        expect(array.pull()).toBeEqual([])
    })

    it("should convert sequence with one element to array", () => {
        const s = seqs.of(1)
        const array = s.toArray()
        expect(array.pull()).toBeEqual([1])
    })
})
describe("toMap", () => {
    // Tests for Seq.toMap
    it("should give empty map on empty", () => {
        const s = seq().toMap(x => [x, x])
        expect(s.pull()).toBeEqual(new Map<never, never>())
    })

    it("should convert to map", () => {
        const s = seqs.of(1, 2, 3).toMap(x => [x, x])
        expect(s.pull()).toBeEqual(
            new Map([
                [1, 1],
                [2, 2],
                [3, 3]
            ])
        )
    })

    it("should convert to map with different keys", () => {
        const s = seqs.of(1, 2, 3).toMap(x => [x + 1, x])
        expect(s.pull()).toBeEqual(
            new Map([
                [2, 1],
                [3, 2],
                [4, 3]
            ])
        )
    })

    it("should replace old key on conflicting", () => {
        const s = seqs.of(1, 2, 3).toMap(x => [x % 2, x])
        expect(s.pull()).toBeEqual(
            new Map([
                [0, 2],
                [1, 3]
            ])
        )
    })
})
describe("toObject", () => {
    it("should give empty object on empty", () => {
        const s = seq().toObject(x => [x, x])
        expect(s.pull()).toBeEqual({})
    })

    it("should convert to object", () => {
        const s = seqs.of(1, 2, 3).toObject(x => [x, x])
        expect(s.pull()).toBeEqual({ 1: 1, 2: 2, 3: 3 })
    })

    it("should convert to object with different keys", () => {
        const s = seqs.of(1, 2, 3).toObject(x => [x + 1, x])
        expect(s.pull()).toBeEqual({ 2: 1, 3: 2, 4: 3 })
    })

    it("should keep set newer entry on conflicting", () => {
        const s = seqs.of(1, 2, 3).toObject(x => [x % 2, x])
        expect(s.pull()).toBeEqual({ 1: 3, 0: 2 })
    })
})
describe("toSet", () => {
    it("should give empty set on empty", () => {
        const s = seq().toSet()
        expect(s.pull()).toBeEqual(new Set())
    })

    it("should convert to set", () => {
        const s = seqs.of(1, 2, 3).toSet()
        expect(s.pull()).toBeEqual(new Set([1, 2, 3]))
    })

    it("should remove duplicates", () => {
        const s = seqs.of(1, 2, 2, 3, 3, 3).toSet()
        expect(s.pull()).toBeEqual(new Set([1, 2, 3]))
    })
})
describe("zip", () => {
    it("should give empty array on empty", () => {
        const s = seqs.empty().toArray()
        expect(s.pull()).toBeEqual([])
    })
    it("should zip two sequences", () => {
        const s1 = seqs.of(1, 2, 3)
        const s2 = seqs.of("a", "b", "c")
        const zipped = s1.zip(s2)
        expect(zipped.toArray().pull()).toBeEqual([
            [1, "a"],
            [2, "b"],
            [3, "c"]
        ])
    })

    it("should end on shorter sequence", () => {
        const s1 = seqs.of(1, 2)
        const s2 = seqs.of("a", "b", "c")
        const zipped = s1.zip(s2)
        expect(zipped.toArray().pull()).toBeEqual([
            [1, "a"],
            [2, "b"]
        ])
    })

    it("should be able to do 5 sequences", () => {
        const s1 = seqs.of(1, 2, 3)
        const s2 = seqs.of("a", "b", "c")
        const s3 = seqs.of(true, false, true)
        const s4 = seqs.of(0, 1, 2)
        const s5 = seqs.of("x", "y", "z")
        const zipped = s1.zip(s2, s3, s4, s5)
        expect(zipped.toArray().pull()).toBeEqual([
            [1, "a", true, 0, "x"],
            [2, "b", false, 1, "y"],
            [3, "c", true, 2, "z"]
        ])
    })
})
