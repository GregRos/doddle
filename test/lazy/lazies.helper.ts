import { lazy } from "@lib"

export const lazies = {
    sync() {
        return lazy(() => 1 as 1)
    },
    async() {
        return lazy(async () => 1 as 1)
    },
    mixed() {
        return lazy(() => 1 as 1 | Promise<1>)
    },
    any() {
        return lazy(() => 1 as any)
    }
}
