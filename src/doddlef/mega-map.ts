const valueKey = Symbol("value")
export class MegaMap<Value> {
    private readonly _root: Map<any, any> = new Map()
    addAt(v: Value, ...key: any[]) {
        let lastMap = this._root

        for (let i = 0; i < key.length; i++) {
            const next = lastMap.get(key[i])
            if (next === undefined) {
                const newMap = new Map()
                lastMap.set(key[i], newMap)
                lastMap = newMap
            } else if (next instanceof Map) {
                // it's another map node
                lastMap = next
            } else {
                throw new Error("unexpected node type")
            }
        }
        lastMap.set(valueKey, v as any)
    }
    removeAt(...key: any[]) {
        let lastMap = this._root
        for (let i = 0; i < key.length; i++) {
            const next = lastMap.get(key[i])
            if (next === undefined) {
                return
            } else if (next instanceof Map) {
                lastMap = next
            } else {
                throw new Error("unexpected node type")
            }
        }
        lastMap.delete(valueKey)
    }
    getAt(...key: any[]): Value | undefined {
        let lastMap = this._root
        for (let i = 0; i < key.length; i++) {
            const next = lastMap.get(key[i])
            if (next === undefined) {
                return undefined
            } else if (next instanceof Map) {
                lastMap = next
            } else {
                throw new Error("unexpected node type")
            }
        }
        return lastMap.get(valueKey) as Value | undefined
    }
}
