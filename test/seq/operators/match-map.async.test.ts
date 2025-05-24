import { aseq, type ASeq } from "@lib"
import { declare, type, type_of } from "declare-it"
const _seq = aseq
type _Seq<T> = ASeq<T>
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
            __default__(a) {
                expect(type_of(a)).to_resemble(type<{ a: "x" | "y" }>)
                return 3 as const
            }
        })
        .each(x => {
            expect(type_of(x)).to_equal(type<1 | 2 | 3>)
        })
    expect(type_of(aa)).to_equal(type<_Seq<1 | 2 | 3>>)
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
    const input = _seq([] as const)
    const afterEmptyMatch = input.matchMap("", {})
    expect(afterEmptyMatch._qr).resolves.toEqual([])
})

it("works for non-empty", () => {
    const afterMatch = objectSeq.matchMap("a", {
        x(a) {
            return 2
        },
        y(a) {
            return 1
        }
    })
    expect(afterMatch._qr).resolves.toEqual([2, 1])
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
    expect(afterMatch._qr).resolves.toEqual([1, 2])
})
