import { seq, type Seq } from "@lib"
import { declare, type, type_of } from "declare-it"
const _seq = seq
type _Seq<T> = Seq<T>

const objectSeq = _seq([
    {
        a: "x"
    },
    {
        a: "y"
    }
] as const)
declare.it("works", expect => {
    expect(type_of(objectSeq.matchMap)).to_subtype(type<Function>)
    const aa = objectSeq
        .matchMap("a", {
            x(a) {
                expect(type_of(a)).to_resemble(type<{ a: "x" }>)
                return 2 as const
            },
            y(a) {
                expect(type_of(a)).to_resemble(type<{ a: "y" }>)
                return 1 as const
            },
            __default__(...args) {
                expect(type_of(args)).to_resemble(type<[{ a: "x" | "y" }, "x" | "y", number]>)
                return 3 as const
            }
        })
        .each(x => {
            expect(type_of(x)).to_equal(type<1 | 2 | 3>)
        })
    expect(type_of(aa)).to_equal(type<_Seq<1 | 2 | 3>>)
})

const deeperObjectSeq = _seq([
    {
        a: {
            b: "x"
        }
    },
    {
        a: {
            b: "y"
        }
    }
] as const)
declare.it("works for path", expect => {
    expect(type_of(deeperObjectSeq.matchMap)).to_subtype(type<Function>)
    const aa = deeperObjectSeq
        .matchMap("a.b", {
            x(a) {
                expect(type_of(a)).to_resemble(type<{ a: { b: "x" } }>)
                return 2 as const
            },
            y(a) {
                expect(type_of(a)).to_resemble(type<{ a: { b: "y" } }>)
                return 1 as const
            },
            __default__(...args) {
                const [obj, key, index] = args
                expect(type_of(obj.a)).to_resemble(type<{ b: "x" | "y" }>)
                expect(type_of(key)).to_resemble(type<"x" | "y">)
                expect(type_of(index)).to_resemble(type<number>)
                return 3 as const
            }
        })
        .each(x => {
            expect(type_of(x)).to_equal(type<1 | 2 | 3>)
        })
})

declare.it("extra property check", expect => {
    const aa = objectSeq.matchMap("a", {
        // @ts-expect-error Should not allow extra properties
        b(a) {
            return 1
        }
    })
})

it("works for empty with empty", () => {
    const input = _seq([])
    const afterEmptyMatch = input.matchMap("", {})
    expect(afterEmptyMatch._qr).toEqual([])
})
it("maps literal with empty path", () => {
    const s = _seq(["a", "b"] as const)
    const afterMatch = s.matchMap("", {
        a(x) {
            return 1
        },
        b() {
            return 2
        }
    })
    expect(afterMatch._qr).toEqual([1, 2])
})
