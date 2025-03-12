import { bindTimeConductorAndSimulator, TimeConductor } from "./simulator/AudioPlayer";
import { Simulator } from "./simulator/Simulator";
import { MusicBeatConverter } from "./tocategorize/music_beat_converter";
import { Ball as PatternBall } from "./tocategorize/mj_parser";
import { RawPreParserEvent } from "./tocategorize/parser_to_scheduler";
import { formatRawEventInput } from "./tocategorize/the_whole_thing";
import { createJugglerCubeGeometry, createJugglerMaterial, Juggler } from "./simulator/Juggler";
import { Table } from "./simulator/Table";
import * as THREE from "three";
import { createHandSites } from "./simulator/Hand";
import { Ball } from "./simulator/Ball";
import { getNoteBuffer } from "./simulator/noteBank";
import { CatchEvent, ThrowEvent } from "./simulator/Timeline";
import { createControls } from "./simulator/TimeConductorUI";

//TODO : Soft errors everywhere !

const timeConductor = new TimeConductor();
// timeConductor.playbackRate = 0.1;
const simulator = new Simulator({
    canvasID: "#simulator_canvas",
    enableAudio: true,
    timeController: timeConductor,
    debug: { showFloorGrid: true, showFloorAxis: true }
});
createControls(document.body, timeConductor);
bindTimeConductorAndSimulator(timeConductor, simulator);

// const jugglerGeometry = createJugglerCubeGeometry(1.8, 0.3, 0.5);
// const jugglerMaterial = createJugglerMaterial("black");

const soundBuffers = new Map<string, AudioBuffer>();
const doBuffer = await getNoteBuffer("C", simulator.listener!.context);
soundBuffers.set("C", doBuffer!);

const juggler = new Juggler({ debug: true });
const ball = new Ball({
    sound: { node: new THREE.PositionalAudio(simulator.listener!), buffers: soundBuffers }
});
simulator.addJuggler("Nicolas", juggler, new THREE.Vector3(-1, 0, 0));
simulator.addBall("Do", ball);

const ev1 = new ThrowEvent({ time: 1, unitTime: 0.3, ball: ball, hand: juggler.rightHand });
const ev2 = new CatchEvent({
    time: 1.9,
    unitTime: 0.3,
    sound: "C",
    ball: ball,
    hand: juggler.leftHand
});

ev1.ball.timeline.addEvent(ev1);
ev2.ball.timeline.addEvent(ev2);
ev1.hand.timeline.addEvent(ev1);
ev2.hand.timeline.addEvent(ev2);

// await timeConductor.play();

// const rawBallsVincent = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do'"];
// const IDSuffixVincent = "?V";
// const rawBallsFlorent = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do'", "Mi'", "Fa#"];
// const IDSuffixFlorent = "?F";
// //prettier-ignore
// const rawEventsVincent: [string, RawPreParserEvent][] = [
//     ["-1, 1/4", { tempo: "1/4", hands: [["Mi", "Do"], ["Sol"]], pattern: "L40441001" }],
//     ["3, 1/4", { hands: [["Mi", "Do"], ["Sol"]], pattern: "L40441001" }],
//     ["7, 1/4", { hands: [["Fa", "Re"], ["La"]], pattern: "L44441001" }],
//     ["11, 1/4", { hands: [["Fa", "Re"], ["La"]], pattern: "L40441001" }],
//     ["15, 1/4", { hands: [["Mi", "Do"], ["Do'", "Sol"]], pattern: "L404[Sol4Do'5]" }],
//     ["19, 1/4", { hands: [["Mi", "Do"], ["Do'", "Sol"]], pattern: "L404[Sol4Do'5]" }],
//     ["23, 1/4", { hands: [["Fa", "Re"], ["La"]], pattern: "L40441001" }],
//     ["28, 2/4", { hands: [["Re"], ["Do'"]], pattern: "R2201" }],
//     ["31, 2/4", { hands: [["Do"], []], pattern: "L1" }],
//     ["32, 0", { tempo: "1/8", pattern: "11" }],
//     ["32, 1/4", { tempo: "1/4", pattern: "1"}],
// ]
// //prettier-ignore
// const rawEventsFlorent: [
//     string,
//     { tempo?: string; hands?: [string[], string[]]; pattern?: string }
// ][] = [
//     ["1, 2/4", { tempo: "1/4", hands: [["Mi"], ["Sol"]], pattern: "R3501001" }],
//     ["5, 2/4", { hands: [["Fa"], ["Sol"]], pattern: "R3501001" }],
//     ["9, 2/4", { hands: [["Fa"], ["La"]], pattern: "R3501001" }],
//     ["13, 2/4", { hands: [["Mi"], ["La"]], pattern: "R3501001" }],
//     ["17, 2/4", { hands: [["Sol"], ["Do'"]], pattern: "R3501001" }],
//     ["21, 2/4", { hands: [["La"], ["Do'"]], pattern: "R3501001" }],
//     ["26, 1/4", { hands: [["Mi'", "Fa#"], ["Sol"]], pattern: "L3(3^2)" }],
//     ["29, 1/4", { hands: [["Do", "La"], ["Sol", "Re"]], pattern: "R445x5x" }],
// ]
// const musicConverter = new MusicBeatConverter([[0, "3/4"]], [[0, { note: "1/4", bpm: 160 }]]);

// const ballsVincent = formatRawBalls(rawBallsVincent, IDSuffixVincent);
// const ballsFlorent = formatRawBalls(rawBallsFlorent, IDSuffixFlorent);

// const eventsVincent = formatRawEventInput(rawEventsVincent, musicConverter);
// const eventsFlorent = formatRawEventInput(rawEventsFlorent, musicConverter);
// const pattern = {
//     jugglers: new Map([
//         // ["NoName", { events: events, balls: balls }]
//         ["Vincent", { events: eventsVincent, balls: ballsVincent }],
//         ["Florent", { events: eventsFlorent, balls: ballsFlorent }]
//     ]),
//     musicConverter: musicConverter
// };

// simulatePattern(pattern, simulator);

// function formatRawBalls(rawBalls: string[], IDSuffix: string): PatternBall[] {
//     const balls: PatternBall[] = [];
//     for (const name of rawBalls) {
//         balls.push({ name: name, id: name + IDSuffix });
//     }
//     return balls;
// }
