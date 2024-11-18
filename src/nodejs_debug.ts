// import { createRBTree, RBTree } from "./RBTree";

import { Recorder } from "tone";

// let a: RBTree<number, number> = createRBTree();
// let b: RBTree<number, number> = a;
// console.log(Object.is(a, b));
// console.log(Object.is(a, b));
// console.log(Object.is(a.find(0).tree, a));
// // a = a.insert(0, 10);
// a = a.insert(0, 11);
// a = a.insert(0, 12);
// a = a.insert(0, 13);
// a = a.insert(0, 14);
// a = a.insert(0, 15);
// // console.log(a);
// a.forEach((key, value) => {
//     console.log(`${key} ${value}`);
// });
// let it = a.find(0);
// console.log(it.value);
// it.next();
// console.log(it.value);
// it.prev();
// console.log(it.value);
// it.prev();
// console.log(it.value);
// it.prev();
// console.log(it.value);
// it.prev();
// console.log(it.value);
// it.prev();
// console.log(it.value);
// a = a.remove(0);
// a.forEach((key, value) => {
//     console.log(`${key} ${value}`);
// });

// import { OrderedMap } from "js-sdsl";

// const a = new OrderedMap([
//     [0, "a"],
//     [0, "a2"],
//     [1, "b"],
//     [2, "c"]
// ] as [number, string][]);
// // console.log(a);
// a.forEach(([key, value]) => {
//     console.log([key, value]);
// });
// console.log(...a.lowerBound(0).pointer); // 1 <= x
// console.log(...a.reverseLowerBound(0).pointer); // x <= 1
// console.log(...a.upperBound(0).pointer); // 1 < x
// console.log(a.reverseUpperBound(0).isAccessible());
// console.log(...a.reverseUpperBound(0).pointer); // x < 1

const a = new Map<
