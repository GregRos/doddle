export class LaziesError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "LaziesError"
    }
}
