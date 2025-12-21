import { doddle } from "../doddle/index.js"

/** Minimal ES decorator context for class getters/methods used here. */
export interface ClassGetterDecoratorContext {
    /** Decorated element kind. We support getters and zero-arg methods. */
    readonly kind: "getter" | "method"
    /** Class member name or symbol. */
    readonly name?: string | symbol
    /** Whether the member is static. */
    readonly static?: boolean
}

// Unique counter to help name anonymous members when no name/description exists.
let index = 0

function makeSymbolName(name?: string | symbol): string {
    // Increment for every decorator application.
    const id = String(index++)
    if (typeof name === "string") return name
    if (typeof name === "symbol") {
        const desc = name.description
        if (desc != null && desc !== "") return desc
    }
    return id
}

function wrapMethod(method: (this: any) => any, name?: string | symbol) {
    const symName = makeSymbolName(name)
    const cacheKey = Symbol(`doddlify:${symName}`)
    return function (this: any) {
        let cached = this[cacheKey]
        if (cached == null) {
            cached = this[cacheKey] = doddle(() => method.call(this))
        }
        return cached.pull()
    }
}

// TypeScript legacy decorator overload (experimental): (target, key, descriptor) => descriptor
export function doddlify(
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor
): PropertyDescriptor | void

// ES decorators (stage-3): (value, context) => new value
export function doddlify(
    value: (this: any) => any,
    context: ClassGetterDecoratorContext
): (this: any) => any
// ES decorators (stage-3) for methods: zero-arg functions only
export function doddlify(
    value: (this: any) => any,
    context: ClassGetterDecoratorContext
): (this: any) => any

export function doddlify(a: any, b: any, c?: any): any {
    // ES decorators path: (fn, context)
    if (typeof a === "function" && c === undefined) {
        const fn = a as (this: any) => any
        const ctx = b as ClassGetterDecoratorContext
        if (ctx?.kind === "getter") {
            return wrapMethod(fn, ctx?.name)
        }
        if (ctx?.kind === "method") {
            // Support only zero-arg methods
            if (fn.length === 0) return wrapMethod(fn, ctx?.name)
            return fn
        }
        return fn
    }

    // TypeScript legacy path: (target, key, descriptor)
    const descriptor = c as PropertyDescriptor | undefined
    if (!descriptor) return descriptor

    // Getter
    if (typeof descriptor.get === "function") {
        descriptor.get = wrapMethod(descriptor.get!, b as string | symbol)
        return descriptor
    }
    // Method (zero-arg only)
    if (typeof descriptor.value === "function") {
        const fn = descriptor.value
        if (fn.length === 0) {
            descriptor.value = wrapMethod(fn, b as string | symbol)
        }
        return descriptor
    }
    return descriptor
}
