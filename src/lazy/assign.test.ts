import { declare, type } from "declare-it"
import type { Lazy } from "./lazy"
import { lazy } from "./from/input"

declare.it("If S ⊆ T then Lazy<S> ⊆ Lazy<T>", expect => {
    expect(type<Lazy<1>>).to_subtype(type<Lazy<number>>)
    let a: Lazy<number> = lazy(() => 1 as const)
    function generic<T, S extends T>(x: T) {
        let lz: Lazy<T> = null! as Lazy<T>
    }
})
