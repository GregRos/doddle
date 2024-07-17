import { lazy } from "stdlazy"

export default {
    sync<In>(this: Iterable<In>) {
        return lazy(() => {
            const result: In[] = []
            for (const item of this) {
                result.push(item)
            }
            return result
        })
    },
    async<In>(this: AsyncIterable<In>) {
        return lazy(async () => {
            const result: In[] = []
            for await (const item of this) {
                result.push(item)
            }
            return result
        })
    }
}
