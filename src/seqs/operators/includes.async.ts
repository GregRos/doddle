import type { LazyAsync } from "../../lazy/index.js"
import { aseq } from "../seq/aseq.js"
import generic from "./includes.js"

function includes<T>(this: AsyncIterable<T>, value: T): LazyAsync<boolean> {
    return generic(aseq(this) as any, value) as any
}
export default includes
