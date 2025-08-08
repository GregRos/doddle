const FRAME = 20

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const isDigit = (ch: string) => ch >= '0' && ch <= '9'

export function matrix(diagram: string): AsyncIterable<AsyncIterable<number>> {
    const lines = diagram
        .split('\n')
        .map(line => line.trimEnd())
        .filter(line => line.trim().length > 0)

    const innerFrom = (timeline: string): AsyncIterable<number> => ({
        async *[Symbol.asyncIterator]() {
            for (let i = 0; i < timeline.length; i++) {
                if (i > 0) {
                    await delay(FRAME)
                }
                const ch = timeline[i]
                if (isDigit(ch)) {
                    yield Number(ch)
                }
            }
        }
    })

    return (async function* () {
        let current = 0
        for (const line of lines) {
            const index = line.indexOf('|')
            if (index === -1) continue
            const start = index * FRAME
            const wait = start - current
            if (wait > 0) {
                await delay(wait)
            }
            current = start
            yield innerFrom(line.slice(index + 1))
        }
    })()
}
