# Doddle

[![CI](https://github.com/GregRos/doddle/actions/workflows/push.yaml/badge.svg)](https://github.com/GregRos/doddle/actions/workflows/push.yaml)

Doddle is a tiny yet comprehensive library for lazy evaluation and iteration.
but incredibly versatile library for working with iterables. It also introduces its own simple yet elegant lazy primitive, which has many of the same qualities as a promise.

Doddle serves the same purpose as lodash, reproducing much of its functionality, except that works on any iterable or async iterable, and is a tiny fraction of the size. This comes at some performance cost, so it's best to use Doddle in I/O bound applications, or when you don't care that much about performance.

Doddle has **100% test coverage according to all metrics**, with **over 1000 individual test cases**. Its type definitions are tested using [declare-it](https://github.com/GregRos/declare-it), a state-of-the-art test library, so you can be sure that all operators will be consistently typed.

Doddle has been designed to be debuggable. It produces readable stack traces that mirror the code you write, and you can easily jump to, inspect, and place breakpoints in its source code.
