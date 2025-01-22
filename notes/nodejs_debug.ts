console.log(Object.is({ 1: 1 }, { 1: 1 }));

// import abcjs from "abcjs";
// const abcNotation = `
// X:1
// T:Untitled score
// C:Composer / arranger
// L:1/4
// Q:1/4=80
// M:4/4
// K:C
// V:1
// a ^a b _b | [K:B] a =a b =b |]
// `;
// const abcNotation = `X:1
// T:Untitled score
// C:Composer / arranger
// L:1/4
// Q:1/4=80
// M:4/4
// K:G
// %%stretchlast true
// V:1 treble nm="Flute" snm="Fl."
// %%MIDI program 73
// V:1
//  f z d z |[K:Bb] f z[Q:1/2=190] e z |[M:2/4] A d |]
// `;
// import abcNotation from "./examples/danube.txt";
// const tuneObject = abcjs.parseOnly(abcNotation)[0];
// const seq = abcjs.synth.sequence(tuneObject, {});
// console.log(seq);

// const b = abcjs.synth.flatten(seq);
// console.log(b);

// const c = abcjs.synth.getMidiFile(seq);
// console.log(c);
// // const accidentals;

// // Parse the ABC notation
// const tuneObject = abcjs.parseOnly(abcNotation)[0].deline()[0];

// // Extract music notes from the parsed object
// const notes: string[] = [];
// tuneObject.staff?.forEach((staff) => {
//     staff.voices?.forEach((voice) => {
//         voice.forEach((note) => {
//             if (note.el_type === "note") {
//                 notes.push(note.pitches?.map((p) => p.name + (p.accidental || "")));
//             }
//         });
//     });
// });
// // Flatten and print all notes in order
// const flattenedNotes = notes.flat().join(", ");
// console.log("All notes in order: ", flattenedNotes);

// import { TuneLine, TuneObject, VoiceItem } from "abcjs";
// import abcjs from "abcjs";

// import { readFileSync } from "fs";

// // Specify the path to the file
// const filePath = "./src/examples/danube.abc"; // Change this to your file path
// let danube: string;

// try {
//     danube = readFileSync(filePath, "utf8");
//     // console.log("File content (synchronous):");
//     // console.log(data);
// } catch (err) {
//     console.error("Error reading the file synchronously:", err.message);
// }
// console.log(danube);
// const music: string[] = [];
// const b = abcjs.parseOnly(danube)[0];
// console.log(`b.getBarLength = ${b.getBarLength()}`);
// console.log(`b.getBeatLength = ${b.getBeatLength()}`);
// console.log(`b.getBeatsPerMeasure = ${b.getBeatsPerMeasure()}`);
// console.log(`b.getBpm = ${b.getBpm()}`);
// console.log(`b.getElementFromChar = ${b.getElementFromChar(1)}`);
// console.log(
//     `b.getKeySignature = ${b.getKeySignature().acc} + ${b.getKeySignature().accidentals}+ ${b.getKeySignature().mode} + ${b.getKeySignature().root}`
// );
// // console.log(`b.getMeter = ${b.getMeter()}`);
// console.log(`b.getMeterFraction = ${b.getMeterFraction().num} + ${b.getMeterFraction().den}`);
// console.log(`b.getPickupLength = ${b.getPickupLength()}`);
// console.log(`b.getSelectableArray = ${b.getSelectableArray()}`);
// console.log(`b.getTotalBeats = ${b.getTotalBeats()}`);
// console.log(`b.getTotalTime = ${b.getTotalTime()}`);
// console.log(`b.lineBreaks = ${b.lineBreaks}`);
// console.log(`b.lines = ${b.lines}`);
// // console.log(`b.makeVoicesArray = ${b.makeVoicesArray()}`);
// console.log(`b.media = ${b.media}`);
// console.log(`b.metaText = ${b.metaText}`);
// console.log(`b.metaTextInfo = ${b.metaTextInfo}`);
// console.log(`b.millisecondsPerMeasure = ${b.millisecondsPerMeasure()}`);
// console.log(`b.version = ${b.version}`);
// console.log(`b.visualTranspose = ${b.visualTranspose}`);
// console.log(`b.warnings = ${b.warnings}`);
// const a = abcjs.parseOnly(danube)[0].deline();
// // a[0].staff[0].meter
// const c = abcjs.parseOnly(`X:1
// L:1/4
// Q:1/4=160
// M:3/4
// K:G
// V:1
//  C | C E F | [M:7/8][L:1/8] z2C DC EG |]`);

// console.log(a);

// //TODO : Account for signature + meter changes (and other things ? Points d'orgues ?)
// function walker(tune: TuneObject) {
//     // tune.getMeter
// }

// function get_beats(part: VoiceItem[]): string[] {
//     const notes: string[] = [];
//     part.forEach((voice_item) => {
//         if (voice_item.el_type === "note") {
//             const duration = voice_item.duration;
//             voice_item.pitches?.forEach((pitch) => {
//                 notes.push(pitch.note);
//             });
//         }
//     });

//     return notes;
// }

// import { log } from "tone/build/esm/core/util/Debug";
// import { Hand } from "./Hand";

// interface Tree<T> {
//     value: T;
//     children: Tree<T>[];
// }

// const a: Tree<number> = {
//     value: 0,
//     children: [
//         {
//             value: 1,
//             children: [
//                 { value: 1, children: [] },
//                 { value: 1, children: [] }
//             ]
//         },
//         { value: 1, children: [] }
//     ]
// };

// type TreeNode = {
//     children?: TreeNode[];
// } & object;

// type Tree2 = {
//     children: Tree2[];
// };

// console.log(a);

// class A {
//     time: number;
//     constructor(time: number) {
//         this.time = time;
//     }
// }

// class B {
//     time: number;
//     b = "a";
//     constructor(time: number) {
//         this.time = time;
//     }
// }

// function isB(x: A | B): x is B {
//     return (x as B).b !== undefined;
// }

// type test = A | B;

// type Chaining = [A, B] | [A, A] | [B, B];

// function bar([x, y]: Chaining) {
//     if (isB(x)) {
//         y;
//     }
// }

// function foo(x: test) {
//     console.log(x.time);
// }

// // type Base = { next(): HandEvent };

// // type SingleThrow = { name: "st" };
// // type SingleCatch = { name: "sc" };
// // type TablePut = Base & { name: "tp" };
// // type TableTake = Base & { name: "tt" };
// // type MultTC = Base & { ev: (SingleThrow | SingleCatch)[] };

// // type HandEvent = (MultTC | TablePut | TableTake) | null;

// // const b: HandEvent = {
// //     name: "tp",
// //     next: () => {
// //         return { ev: [{ name: "st" }, { name: "st" }, { name: "sc" }], next: () => null };
// //     }
// // };

// // interface Base { next(): HandEvent };

// // interface SingleThrow { name: "st" };
// // interface SingleCatch { name: "sc" };
// // interface TablePut Base & { name: "tp" };
// // interface TableTake = Base & { name: "tt" };
// // interface MultTC = Base & { ev: (SingleThrow | SingleCatch)[] };

// // type HandEvent = (MultTC | TablePut | TableTake) | null;

// // const b: HandEvent = {
// //     name: "tp",
// //     next: () => {
// //         return { ev: [{ name: "st" }, { name: "st" }, { name: "sc" }], next: () => null };
// //     }
// // };

// // console.log(Infinity < Infinity);

// const a = `${1}`;
// const b = `a${a}`;
// throw Error("Test");
// console.log(b);
