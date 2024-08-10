import type { LazyAsync } from "../../lazy/index.js"
import { aseq } from "../seq/aseq.js"
import generic from "./at.js"

function at<T>(this: AsyncIterable<T>, index: number): LazyAsync<T | undefined> {
    return generic(at, aseq(this) as any, index) as any
}
export default at
