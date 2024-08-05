import { declare, type } from "declare-it"
import { lazy } from "./from/input"
import type { Lazy } from "./lazy"

declare.it("If S ⊆ T then Lazy<S> ⊆ Lazy<T>", expect => {
    expect(type<Lazy<1>>).to_subtype(type<Lazy<number>>)
    let a: Lazy<number> = lazy(() => 1 as const)
    function generic<T, S extends T>() {
        let lz: Lazy<T> = null! as Lazy<S>
    }
})
