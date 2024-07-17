import type {
    AnyPromisedSeqLike,
    AnySeq,
    AnySeqLike,
    AsyncIteratee,
    AsyncIteratee2,
    replaceIteratedElement
} from "../../async/types"
import { syncFrom, asyncFrom, SeqFrom, ASeqFrom } from "../from"
import type { SeqLike } from "../../sync"
import type { Iteratee, Iteratee2 } from "../../sync/types"

export default {
    sync<In, Out>(this: Iterable<In>, projection: Iteratee2<In, SeqLike<Out>>) {
        const self = this
        return new SeqFrom(function* concatMap() {
            let i = 0
            for (const input of self) {
                yield* syncFrom(projection.call(self, input, i++))
            }
        })
    },
    async<In, Out>(this: AsyncIterable<In>, projection: AsyncIteratee2<In, AnySeqLike<Out>>) {
        const self = this
        return new ASeqFrom(async function* concat() {
            let i = 0
            for await (const input of self) {
                yield* asyncFrom(projection.call(self, input, i++))
            }
        })
    }
}
