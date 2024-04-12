export class LaziesError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LaziesError";
    }
}

export class LaziesNoValueError extends LaziesError {
    constructor() {
        super("Lazy object did not produce a value.");
        this.name = "LazyNoValueError";
    }
}
