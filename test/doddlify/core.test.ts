import { doddlify } from "@lib"

it("decorates", () => {
    class ABC {
        @doddlify
        get hello(): { a: number } {
            return {
                a: 42
            }
        }
    }
    const result = new ABC()
    expect(result.hello).toEqual({ a: 42 })
})

it("executes once", () => {
    const mockFn = jest.fn(() => ({ a: 42 }))
    class ABC {
        @doddlify
        get hello(): { a: number } {
            return mockFn()
        }
    }
    const result = new ABC()
    expect(result.hello).toEqual({ a: 42 })
    expect(result.hello).toEqual({ a: 42 })
    expect(mockFn).toHaveBeenCalledTimes(1)
})
