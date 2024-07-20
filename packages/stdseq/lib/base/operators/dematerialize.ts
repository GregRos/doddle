import type {
    AnyPromisedSeqLike,
    AnySeq,
    AnySeqLike,
    AsyncIteratee,
    AsyncIteratee2,
    replaceIteratedElement
} from "../../async/types"
import { syncFrom, asyncFrom, SeqFrom, ASeqFrom } from "../from"
import type { SeqLikeInput } from "../../sync"
import type { Iteratee, Iteratee2 } from "../../sync/types"

export default {
    sync<In>(this: Iterable<In>) {
        const self = this
        return new SeqFrom(function* dematerialize() {
            let i = 0
            for (const input of self) {
                yield { done: false, value: input } as const
            }
            yield { done: true, value: undefined } as const
        })
    },
    async<In>(this: AsyncIterable<In>) {
        const self = this
        return new ASeqFrom(async function* dematerialize() {
            for await (const item of self) {
                yield { done: false, value: item } as const
            }
            yield { done: true, value: undefined } as const
        })
    }
}
