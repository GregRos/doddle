/* eslint-disable @typescript-eslint/await-thenable */
import * as config from "./config"
import { lazy } from "./from/input"
import { cannotRecurseSync } from "./errors"
import assemble from "./operators/assemble"
import each from "./operators/each"
import equals from "./operators/equals"
import map from "./operators/map"
import zip from "./operators/zip"
import { sync as syncIterate, async as asyncIterate } from "./operators/iterate"
import {
    LazyAsync,
    LazyInfo,
    Pullable,
    Pulled,
    PulledAwaited,
    getClassName,
    getInitializerName,
    isPullable,
    isThenable,
    type _IterationType
} from "./types"
import { isAsyncIterable, isIterable } from "./utils"
export const methodName = Symbol("methodName")
export const ownerInstance = Symbol("ownerInstance")

/**
 * A TypeScript-first lazy evaluation primitive. A {@link Pullable} that will only evaluate its
 * initializer function when the {@link pull} method is called.
 *
 * The initializer can return another {@link Lazy}, which will be chained like a promise.
 */
export class Lazy<T>
    implements Pullable<T>, Iterable<_IterationType<T>>, AsyncIterable<_IterationType<T>>
{
    /** The cached value or error, stored from a previous execution of the initializer. */
    private _cached?: any
    private _desc: string
    private _info: LazyInfo
    get info(): Readonly<LazyInfo> {
        return this._info
    }
    /**
     * The initializer function that will be called to construct the value. It will be cleared after
     * the value is constructed, unless `LAZY_NOCLEAR` is set.
     */
    private _init: null | ((...args: any[]) => T)

    protected constructor(initializer: (...args: any[]) => any) {
        this._info = {
            get isReady() {
                return this.stage === "done" || this.stage === "threw"
            },
            stage: "untouched",
            syncness: "untouched",
            name: getInitializerName(initializer)
        }
        this._desc = this._makeDescription()
        this._init = initializer

        const anyMe = this as any
        for (const key of ["pull", "map", "each", "zip", "assemble"]) {
            anyMe[key] = anyMe[key].bind(this)
            anyMe[key][ownerInstance] = this
            anyMe[key][methodName] = key
        }
    }

    static create<T>(f: () => T): Lazy<T> {
        return new Lazy(f)
    }

    private _makeDescription(resolved?: any) {
        const asyncPart = this._info.syncness === "untouched" ? [] : [this._info.syncness]
        const stagePart =
            this._info.stage === "done" ? getClassName(resolved) : `<${this._info.stage}>`
        const name = this._info.name ? `lazy(${this._info.name})` : "lazy"
        return [name, ...asyncPart, stagePart].join(" ")
    }

    map = map
    each = each
    zip = zip
    assemble = assemble
    equals = equals;
    [Symbol.iterator] = syncIterate;
    [Symbol.asyncIterator] = asyncIterate
    /** Returns a short description of the Lazy value and its state. */
    toString() {
        return this._desc
    }

    /**
     * Evaluates this {@link Lazy} instance, flattening any nested {@link Lazy} or {@link Promise}
     * types.
     *
     * @returns The value produced by the initializer, after flattening any nested {@link Lazy} or
     *   {@link Promise} instances.
     * @throws The error thrown during initialization, if any.
     */
    pull(): Pulled<T> {
        const info = this._info
        if (info.stage === "threw") {
            throw this._cached
        }
        if (info.stage === "executing") {
            if (info.syncness === "async") {
                return this._cached
            } else {
                throw cannotRecurseSync()
            }
        }
        if (info.stage === "done") {
            return this._cached!
        }
        info.stage = "executing"
        this._desc = this._makeDescription()
        let resource: any
        try {
            const result = this._init!()
            resource = isPullable(result) ? result.pull() : result
        } catch (e) {
            this._cached = e
            info.stage = "threw"
            this._desc = this._makeDescription()
            throw e
        }
        // No need to keep holding a reference to the constructor.
        if (!config.LAZY_NOCLEAR) {
            this._init = null
        }
        if (isThenable(resource)) {
            info.syncness = "async"
            resource = resource.then(value => {
                if (isPullable(value)) {
                    value = value.pull()
                }
                info.stage = "done"
                this._desc = this._makeDescription(value)
                return value
            })
        } else {
            info.syncness = "sync"
            info.stage = "done"
        }
        this._cached = resource
        this._desc = this._makeDescription()

        return resource
    }

    get [Symbol.toStringTag]() {
        return this.toString()
    }
}
