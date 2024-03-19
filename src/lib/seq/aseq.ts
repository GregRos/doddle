async function run() {
    async function* testing() {
        yield 1;
        yield 2;
        yield 3;
    }

    const a = testing();

    const xs = [a.next(), a.next(), a.next(), a.next()];

    const allOfThem = Promise.all(xs);
    return await allOfThem;
}

run().then(console.log);
