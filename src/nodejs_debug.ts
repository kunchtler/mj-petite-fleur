import { log } from "tone/build/esm/core/util/Debug";
import { Hand } from "./Hand";

interface Tree<T> {
    value: T;
    children: Tree<T>[];
}

const a: Tree<number> = {
    value: 0,
    children: [
        {
            value: 1,
            children: [
                { value: 1, children: [] },
                { value: 1, children: [] }
            ]
        },
        { value: 1, children: [] }
    ]
};

type TreeNode = {
    children?: TreeNode[];
} & object;

type Tree2 = {
    children: Tree2[];
};

console.log(a);

class A {
    time: number;
    constructor(time: number) {
        this.time = time;
    }
}

class B {
    time: number;
    b = "a";
    constructor(time: number) {
        this.time = time;
    }
}

function isB(x: A | B): x is B {
    return (x as B).b !== undefined;
}

type test = A | B;

type Chaining = [A, B] | [A, A] | [B, B];

function bar([x, y]: Chaining) {
    if (isB(x)) {
        y;
    }
}

function foo(x: test) {
    console.log(x.time);
}

// type Base = { next(): HandEvent };

// type SingleThrow = { name: "st" };
// type SingleCatch = { name: "sc" };
// type TablePut = Base & { name: "tp" };
// type TableTake = Base & { name: "tt" };
// type MultTC = Base & { ev: (SingleThrow | SingleCatch)[] };

// type HandEvent = (MultTC | TablePut | TableTake) | null;

// const b: HandEvent = {
//     name: "tp",
//     next: () => {
//         return { ev: [{ name: "st" }, { name: "st" }, { name: "sc" }], next: () => null };
//     }
// };

// interface Base { next(): HandEvent };

// interface SingleThrow { name: "st" };
// interface SingleCatch { name: "sc" };
// interface TablePut Base & { name: "tp" };
// interface TableTake = Base & { name: "tt" };
// interface MultTC = Base & { ev: (SingleThrow | SingleCatch)[] };

// type HandEvent = (MultTC | TablePut | TableTake) | null;

// const b: HandEvent = {
//     name: "tp",
//     next: () => {
//         return { ev: [{ name: "st" }, { name: "st" }, { name: "sc" }], next: () => null };
//     }
// };

// console.log(Infinity < Infinity);
