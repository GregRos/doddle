import type { Seq } from "../seq"
import { fromSyncInput } from "./input"

export function sync<T>(...items: T[]): Seq<T> {
    return fromSyncInput(items)
}
