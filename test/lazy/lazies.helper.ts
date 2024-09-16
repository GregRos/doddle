import { doddle } from "@lib"

export const lazies = {
    sync() {
        return doddle(() => 1 as 1)
    },
    async() {
        return doddle(async () => 1 as 1)
    },
    mixed() {
        return doddle(() => 1 as 1 | Promise<1>)
    },
    any() {
        return doddle(() => 1 as any)
    }
}
