export interface DoddleReadableStreamReader<T> {
    cancel(reason: any): Promise<void>
    read(): Promise<{ done: boolean; value?: T }>
    releaseLock(): void
}

export interface DoddleReadableStream<T> {
    getReader(): DoddleReadableStreamReader<T>
}
