import { lazy } from "./ctor"

export { lazy, memoize } from "./ctor"

export {
    isLazy,
    isPullable,
    isThenable,
    LazyAsync,
    LazyAsyncLike,
    LazyInitializer,
    LazyStage,
    LazySyncness,
    Pullable,
    Pulled,
    PulledAwaited
} from "./types"

export { Lazy } from "./lazy"

const a = lazy(async () => lazy(() => 1))
