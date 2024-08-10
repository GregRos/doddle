import { splat, type Text } from "./text.js"

export class Doddle extends Error {
    constructor(message: Text) {
        super(splat(!Array.isArray(message) ? [message] : message))
    }
}

export function cannotRecurseSync() {
    return new Doddle(
        `Tried to call 'Lazy.pull' recursively in a sync context, which would not terminate.`
    )
}
