export class LazyError extends Error {
    constructor(
        readonly code: string,
        message: string
    ) {
        super(message)
        this.name = "LazyError"
    }
}

export function cannotRecurseSync(): Error {
    return new LazyError(
        "lazies/recursed",
        "Cannot call `pull` in a synchronous context when the initializer is running."
    )
}
