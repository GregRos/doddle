import { chk } from "../seq/_seq.js"

import { seq } from "../seq/seq.js"

export function sync(start: number, end: number, size = 1) {
    chk(sync).size(size)
    chk(sync).start(start)
    chk(sync).end(end)
    const direction = Math.sign(end - start)
    return seq(function* range() {
        for (let i = start; direction * i < direction * end; i += direction * size) {
            yield i
        }
    })
}

export function async(start: number, end: number, size = 1) {
    chk(sync).size(size)
    chk(sync).start(start)
    chk(sync).end(end)
    return seq(sync(start, end, size)).aseq()
}
