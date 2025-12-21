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
