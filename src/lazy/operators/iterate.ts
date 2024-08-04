import type { Lazy } from "../lazy"
import type { _IterationType } from "../types"
import { isAsyncIterable, isIterable } from "../utils"

export function* sync<T>(this: Lazy<T>): Iterator<_IterationType<T>> {
    const inner = this.pull()
    if (isIterable(inner)) {
        yield* inner as Iterable<_IterationType<T>>
    } else {
        yield inner as _IterationType<T>
    }
}

export async function* async<T>(this: Lazy<Promise<T>>): AsyncIterator<_IterationType<T>> {
    // eslint-disable @typescript-eslint/await-thenable
    const inner = await this.pull()
    if (isAsyncIterable(inner) || isIterable(inner)) {
        yield* inner as Iterable<_IterationType<T>>
    } else {
        yield inner as _IterationType<T>
    }
}
