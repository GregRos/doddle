import { mustBeFunction } from "../errors/error"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { ASeq } from "../seq/aseq.class"
import type { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"

export interface SkipWhileOptions {
    skipFinal?: boolean
}
enum SkippingMode {
    None = 0,
    Skipping = 1,
    NotSkipping = 2
}
export function sync<T>(
    this: Iterable<T>,
    predicate: Seq.Predicate<T>,
    options?: SkipWhileOptions
): Seq<T> {
    mustBeFunction("predicate", predicate)
    return new syncOperator("skipWhile", this, function* (input) {
        let prevMode = SkippingMode.None as SkippingMode
        let index = 0
        for (const element of input) {
            if (prevMode === SkippingMode.NotSkipping) {
                yield element
                continue
            }
            const newSkipping: boolean = predicate(element, index++)
            if (!newSkipping) {
                if (prevMode !== SkippingMode.Skipping || !options?.skipFinal) {
                    yield element
                }
            }
            prevMode = newSkipping ? SkippingMode.Skipping : SkippingMode.NotSkipping
        }
    }) as any
}
export function async<T>(
    this: AsyncIterable<T>,
    predicate: ASeq.Predicate<T>,
    options?: SkipWhileOptions
): ASeq<T> {
    mustBeFunction("predicate", predicate)
    return new asyncOperator("skipWhile", this, async function* (input) {
        let prevMode = SkippingMode.None as SkippingMode
        let index = 0
        for await (const element of input) {
            if (prevMode === SkippingMode.NotSkipping) {
                yield element
                continue
            }
            const newSkipping: boolean = await predicate(element, index++)
            if (!newSkipping) {
                if (prevMode !== SkippingMode.Skipping || !options?.skipFinal) {
                    yield element
                }
            }
            prevMode = newSkipping ? SkippingMode.Skipping : SkippingMode.NotSkipping
        }
    }) as any
}