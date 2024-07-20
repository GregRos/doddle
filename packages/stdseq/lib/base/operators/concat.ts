import type { AnyPromisedSeqLike, AnySeqLike } from "../../async/types"
import { asyncFrom, syncFrom } from "../from"
import type { SeqLikeInput } from "../../sync"

export default {
    sync<In, Subject extends Iterable<In>, Ts extends SeqLikeInput<any>[]>(
        this: Subject,
        inputs: Ts
    ) {
        const self = this
        return syncFrom(function* concat() {
            yield* self
            for (const input of inputs) {
                yield* syncFrom(input)
            }
        })
    },
    async<In, Subject extends AsyncIterable<In>, Ts extends AnyPromisedSeqLike<any>[]>(
        this: Subject,
        inputs: Ts
    ) {
        const self = this
        return asyncFrom(async function* concat() {
            yield* self
            for (const input of inputs) {
                yield* asyncFrom(input)
            }
        })
    }
}
