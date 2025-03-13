export interface DoddleReadableStreamReader<T> {
    read(): Promise<{ done: boolean; value?: T }>
    releaseLock(): void
    cancel(reason: any): Promise<void>
}

export interface DoddleReadableStream<T> {
    getReader(): DoddleReadableStreamReader<T>
}
