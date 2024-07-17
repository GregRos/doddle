import { ASeqFrom, SeqFrom } from "../from"

export default {
    sync<In>(this: Iterable<In>, predicate: (value: In, index: number) => boolean) {
        const self = this
        return new SeqFrom(function* takeWhile() {
            let i = 0
            for (const input of self) {
                if (!predicate(input, i++)) {
                    break
                }
                yield input
            }
        })
    },
    async<In>(this: AsyncIterable<In>, predicate: (value: In, index: number) => boolean) {
        const self = this
        return new ASeqFrom(async function* takeWhile() {
            let i = 0
            for await (const input of self) {
                if (!predicate(input, i++)) {
                    break
                }
                yield input
            }
        })
    }
}
