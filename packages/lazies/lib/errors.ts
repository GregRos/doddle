export class LaziesNoValueError extends Error {
    constructor() {
        super("Lazy object did not produce a value.");
        this.name = "LazyNoValueError";
    }
}
