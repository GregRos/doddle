import { lazy } from "../lazy"
import type { Lazy } from "../lazy"
import type { LazyAsync } from "../types"

function equals<T extends Other, Other>(
    this: LazyAsync<T>,
    other: Lazy<Other> | Other
): LazyAsync<boolean>
function equals<T extends Other, Other>(
    this: LazyAsync<T>,
    other: LazyAsync<Other>
): LazyAsync<boolean>
function equals<T extends Other, Other>(this: Lazy<T>, other: LazyAsync<Other>): LazyAsync<boolean>
function equals<T extends Other, Other>(this: Lazy<T>, other: Other | Lazy<Other>): Lazy<boolean>
function equals<T, Other extends T>(
    this: LazyAsync<T>,
    other: Lazy<Other> | Other
): LazyAsync<boolean>
function equals<T, Other extends T>(this: LazyAsync<T>, other: LazyAsync<Other>): LazyAsync<boolean>
function equals<T, Other extends T>(this: Lazy<T>, other: LazyAsync<Other>): LazyAsync<boolean>
function equals<T, Other extends T>(this: Lazy<T>, other: Other | Lazy<Other>): Lazy<boolean>
function equals<T>(this: Lazy<T>, other: any): any {
    return this.zip(lazy(() => other) as any).map(([a, b]) => a === b)
}

export default equals
