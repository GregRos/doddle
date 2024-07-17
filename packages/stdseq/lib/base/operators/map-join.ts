import type { AsyncIteratee2 } from "../../async/types"
import type { Iteratee2 } from "../../sync/types"
import { ASeqFrom, asyncFrom, SeqFrom, syncFrom } from "../from"

export default {
    sync<In, Out>(this: Iterable<In>, projection: Iteratee2<In, Out>) {
        const self = this
        return new SeqFrom(function* mapJoin() {
            let i = 0
            for (const input of self) {
                yield [input, projection.call(self, input, i++)] as [In, Out]
            }
        })
    },
    async<In, Out>(this: AsyncIterable<In>, projection: AsyncIteratee2<In, Out>) {
        const self = this
        return new ASeqFrom(async function* mapJoin() {
            let i = 0
            for await (const input of self) {
                yield [input, await projection.call(self, input, i++)] as [In, Out]
            }
        })
    }
}
