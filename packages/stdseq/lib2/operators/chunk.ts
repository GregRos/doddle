import { mustBeNatural, notEnoughElements } from "../errors/error"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { getOptionalTuple } from "../type-functions/get-optional-tuple"
import type { getTuple } from "../type-functions/get-tuple"

export function sync<T, L extends number, AllowSmaller extends boolean = false>(
    this: Iterable<T>,
    size: L,
    allowSmaller?: AllowSmaller
): AllowSmaller extends true ? getOptionalTuple<T, L> : getTuple<T, L> {
    mustBeNatural("size", size)
    return syncFromOperator("chunk", this, function* (input) {
        let group: T[] = []
        for (const item of input) {
            group.push(item)
            if (group.length === size) {
                yield group as getTuple<T, L>
                group = []
            }
        }
        if (group.length) {
            if (allowSmaller) {
                yield group as getOptionalTuple<T, L>
            } else {
                notEnoughElements("target", group.length, size)
            }
        }
    }) as any
}

export function async<T, L extends number, AllowSmaller extends boolean = false>(
    this: AsyncIterable<T>,
    size: L,
    allowSmaller?: AllowSmaller
) {
    return asyncFromOperator("chunk", this, async function* (input) {
        let group: T[] = []
        for await (const item of input) {
            group.push(item)
            if (group.length === size) {
                yield group as getTuple<T, L>
                group = []
            }
        }
        if (group.length) {
            if (allowSmaller) {
                yield group as getOptionalTuple<T, L>
            } else {
                notEnoughElements("target", group.length, size)
            }
        }
    })
}
