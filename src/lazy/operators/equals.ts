import { lazy } from "../ctor"
import type { Lazy } from "../lazy"
import type { LazyAsync } from "../types"

function equals<Other>(other: Promise<Other> | LazyAsync<Other>): LazyAsync<boolean>
function equals<Other>(other: Other | Lazy<Other>): Lazy<boolean>
function equals<T>(this: Lazy<T>, other: any): any {
    return this.zip(lazy(() => other) as any).map(([a, b]) => a === b)
}

export default equals
