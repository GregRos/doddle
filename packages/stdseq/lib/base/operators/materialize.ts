import { ASeqFrom, SeqFrom } from "../from"

export default {
    sync<In>(this: Iterable<IteratorResult<In>>) {
        const self = this
        return new SeqFrom(function* materialize() {
            let final: IteratorResult<In> | undefined
            for (const input of self) {
                final = input
                if (input.done) {
                    break
                }
                yield input.value
            }
            if (final) {
                return final.value
            }
        })
    },
    async<In>(this: AsyncIterable<IteratorResult<In>>) {
        const self = this
        return new ASeqFrom(async function* materialize() {
            let final: Awaited<IteratorResult<In>> | undefined
            for await (const input of self) {
                final = input
                if (input.done) {
                    break
                }
                yield input.value
            }
            if (final) {
                return final.value
            }
        })
    }
}
