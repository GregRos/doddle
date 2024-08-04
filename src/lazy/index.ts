import { lazy } from "./from/input"

export { lazy } from "./from/input"
export { memoize } from "./from/memoize"
export { Lazy } from "./lazy"
export {
    getClassName,
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
export { isAsyncIterable, isIterable, isNextable } from "./utils"

const a = lazy(async () => lazy(() => 1))
