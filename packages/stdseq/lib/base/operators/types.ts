import type { SeqLike } from "../../sync"

export type SyncSeqBase<T> = Iterable<T> & {
    _wrap<S>(input: SeqLike<S>): SyncSeqBase<S>
}
