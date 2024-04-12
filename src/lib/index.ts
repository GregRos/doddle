import { Lazy, lazy, memoize } from "./lazy/lazy";

import {
    LazyAsyncLike,
    LazyInitializer,
    LazyLike,
    LazyStage
} from "./lazy/lazy-like";
import { LazyAsync, Pulled, PulledAwaited } from "./lazy/types";
import { seq } from "./seq/sync/seq";
import { seqs } from "./seq/sync/seqs";
import { Seq } from "./seq/sync/wrapper";
import { isLazyLike } from "./util";

export * from "./seq/sync/types";
export {
    Lazy,
    seqs,
    LazyAsync,
    LazyStage,
    isLazyLike,
    LazyAsyncLike,
    LazyLike,
    LazyInitializer,
    Pulled,
    PulledAwaited,
    lazy,
    seq,
    memoize,
    Seq
};
