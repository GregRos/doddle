import { lazy } from "./ctor"

export { lazy, memoize } from "./ctor"

export {
    LazyAsync,
    LazyAsyncLike,
    LazyInitializer,
    LazyStage,
    LazySyncness,
    Pullable,
    Pulled,
    PulledAwaited,
    isLazy,
    isPullable,
    isThenable
} from "./types"

export { Lazy } from "./lazy"
function aa(this: unknown, a: number): number {
    return 2
}
const a = lazy(async () => lazy(() => 1))
