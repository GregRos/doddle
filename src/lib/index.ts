import { Lazy, lazy } from "./lazy/lazy";

import {
    LazyAsyncLike,
    LazyInitializer,
    LazyLike,
    LazyStage
} from "./lazy/lazy-like";
import { LazyAsync, Pulled, PulledAwaited } from "./lazy/types";
import { isLazyLike } from "./util";

export {
    Lazy,
    LazyAsync,
    LazyStage,
    isLazyLike,
    LazyAsyncLike,
    LazyLike,
    LazyInitializer,
    Pulled,
    PulledAwaited,
    lazy
};
