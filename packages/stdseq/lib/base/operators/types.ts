import type { SeqLikeInput } from "../../sync"

export type SyncSeqBase<T> = Iterable<T> & {
    _wrap<S>(input: SeqLikeInput<S>): SyncSeqBase<S>
}
