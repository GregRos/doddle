import "@lib"
declare module "@lib" {
    export interface ASeq<T> {
        _qr: Promise<T[]>
    }

    export interface Seq<T> {
        _qr: T[]
    }
}
