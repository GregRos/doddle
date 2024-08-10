import { loadCheckers } from "./load-checkers.js"
export abstract class _Seq {
    loadCheckers() {
        loadCheckers(this)
    }
}

export { chk } from "./load-checkers.js"
