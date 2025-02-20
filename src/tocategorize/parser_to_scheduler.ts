import Fraction from "fraction.js";
import {
    ParserJugglingEvent,
    ParserToss,
    stringifyFraction
} from "../parser/siteswap_mj/MusicalSiteswap";
import { MusicBeatConverter } from "./music_beat_converter";
import { SchedulerEvent, PartialToss, PartialTossMode, PartialBall } from "./mj_parser";
import { closestWordsTo } from "./levenshtein_distance";
import { setIntersection } from "../utils/SetOperations";

export interface ParserToSchedulerParams {
    events: ParserJugglingEvent[];
    jugglerNames: Set<string>;
    defaultJugglerName: string;
    startBeat: Fraction;
    tempo: Fraction;
    ballNames?: Set<string>;
    ballIDs?: Map<string, string>;
    musicConverter?: MusicBeatConverter;
}

export function parserToSchedulerEvents({
    events,
    jugglerNames,
    defaultJugglerName,
    startBeat,
    tempo,
    ballNames,
    ballIDs,
    musicConverter
}: ParserToSchedulerParams): [Fraction, SchedulerEvent][] {
    if (!jugglerNames.has(defaultJugglerName)) {
        handleUnkownName(defaultJugglerName, jugglerNames, "juggler");
    }
    if (ballNames === undefined) {
        ballNames = new Set(ballIDs !== undefined ? ballIDs.values() : []);
    }
    if (ballIDs === undefined) {
        ballIDs = new Map();
    }
    checkDuplicateBallName(ballNames, ballIDs);
    const newEvents: [Fraction, SchedulerEvent][] = [];
    let beat = startBeat;
    for (const ev of events) {
        const newTosses: PartialToss[] = [];
        if (ev.tosses !== undefined) {
            for (const toss of ev.tosses) {
                const mode = getMode(toss, beat, musicConverter);
                const ball = getBall(toss, ballNames, ballIDs);
                const fromJuggler = defaultJugglerName;
                const toJuggler = getToJuggler(toss, defaultJugglerName, jugglerNames);
                newTosses.push({
                    from: { juggler: fromJuggler, hand: toss.fromHand, beat: beat },
                    to: {
                        juggler: toJuggler,
                        hand: toss.toHand,
                        ...mode
                    },
                    ball: ball
                });
            }
        }
        const newEv: SchedulerEvent = {
            newDefaultHand: ev.newDefaultHand,
            tosses: newTosses
        };
        newEvents.push([beat, newEv]);
        beat = beat.add(tempo);
    }
    return filterEmptyEvents(newEvents);
}

function checkDuplicateBallName(ballNames: Set<string>, ballIDs: Map<string, string>): void {
    const inter = setIntersection(ballNames, new Set(ballIDs.keys()));
    if (inter.size > 0) {
        let text = "Some balls are both a name and an ID :";
        for (const name of inter) {
            text += ` ${name}`;
        }
        text += ".";
        throw Error(text);
    }
}

function handleUnkownName(name: string, namesList: Iterable<string>, nameCategory: string) {
    let text = `Unknown ${nameCategory} : "${name}".`;
    const closeMatches = closestWordsTo(name, namesList, 2);
    if (closeMatches.length > 0) {
        text += ` Did you mean "${closestWordsTo(name, namesList, 2)}" ?`;
    }
    throw Error(text);
}

function getToJuggler(
    toss: ParserToss,
    defaultJugglerName: string,
    jugglerNames: Set<string>
): string {
    if (toss.toJuggler !== undefined && !jugglerNames.has(toss.toJuggler)) {
        handleUnkownName(toss.toJuggler, jugglerNames, "juggler");
    }
    return toss.toJuggler ?? defaultJugglerName;
}

function getBall(
    toss: ParserToss,
    ballNames: Set<string>,
    ballIDs: Map<string, string>
): PartialBall | undefined {
    if (toss.ballNameOrID !== undefined) {
        if (ballNames.has(toss.ballNameOrID)) {
            return { name: toss.ballNameOrID };
        } else if (ballIDs.has(toss.ballNameOrID)) {
            return { name: ballIDs.get(toss.ballNameOrID)!, id: toss.ballNameOrID };
        } else {
            handleUnkownName(toss.ballNameOrID, [...ballNames, ...ballIDs.keys()], "ball");
        }
    }
    return undefined;
}

function getMode(
    toss: ParserToss,
    beat: Fraction,
    musicConverter?: MusicBeatConverter
): PartialTossMode {
    if (toss.mode === "Height") {
        return { mode: "Height", height: toss.height };
    } else if (toss.mode === "AbsBeat") {
        return { mode: "Beat", beat: toss.beat };
    } else if (toss.mode === "AbsMeasureBeat") {
        if (musicConverter === undefined) {
            throw Error("No Signature information was provided to be able to use measures");
        }
        return {
            mode: "Beat",
            beat: musicConverter.convertMeasureBeat(toss.measureBeat)
        };
    }
    return { mode: "Beat", beat: beat.add(toss.beat) };
}

function filterEmptyEvents(events: [Fraction, SchedulerEvent][]): [Fraction, SchedulerEvent][] {
    const newEvents: [Fraction, SchedulerEvent][] = [];
    for (const [beat, ev] of events) {
        if (
            ev.tosses === undefined &&
            ev.tempoChange === undefined &&
            ev.newDefaultHand === undefined &&
            ev.ballsInHands === undefined
        ) {
            continue;
        }
        const newTosses = ev.tosses?.filter(keepToss);
        if (newTosses?.length === 0) {
            continue;
        }
        newEvents.push([beat, { ...ev, tosses: newTosses }]);
    }
    return newEvents;
}

function keepToss(toss: PartialToss): boolean {
    return (
        (toss.to.mode === "Height" && toss.to.height > 0) ||
        (toss.to.mode === "Beat" && toss.to.beat.gt(toss.from.beat))
    );
}

// Printing Functions
export function stringifySchedulerEvent(ev: SchedulerEvent): string {
    if (
        ev.newDefaultHand === undefined &&
        ev.tosses === undefined &&
        ev.ballsInHands === undefined &&
        ev.tempoChange === undefined
    ) {
        return "Empty Event.";
    }
    let text = "";
    if (ev.newDefaultHand !== undefined) {
        text += `New default hand: ${ev.newDefaultHand}\n`;
    }
    if (ev.tempoChange !== undefined) {
        text += `Tempo Change: ${stringifyFraction(ev.tempoChange)}\n`;
    }
    if (ev.ballsInHands !== undefined) {
        text += `New balls in hand: Left${stringifyHand(ev.ballsInHands[0])} Right${stringifyHand(ev.ballsInHands[1])} \n`;
    }
    if (ev.tosses !== undefined) {
        for (let i = 0; i < ev.tosses.length; i++) {
            const toss = ev.tosses[i];
            text += `Toss ${i} (beat ${stringifyFraction(toss.from.beat)}): Ball`;
            if (toss.ball !== undefined) {
                text += ` ${stringifyBall(toss.ball)}`;
            }
            if (toss.to.mode === "Height") {
                text += ` tossed at height ${toss.to.height}`;
            } else {
                text += ` tossed to beat ${stringifyFraction(toss.to.beat)}`;
            }
            text += ` from ${toss.from.juggler}`;
            if (toss.from.hand !== undefined) {
                const hand = toss.from.hand === "L" ? "left" : "right";
                text += `'s ${hand} hand`;
            }
            text += ` to ${toss.to.juggler}`;
            if (toss.to.hand !== undefined) {
                let hand: string;
                if (toss.to.hand === "L") {
                    hand = "left";
                } else if (toss.to.hand === "R") {
                    hand = "right";
                } else {
                    hand = "other";
                }
                text += `'s ${hand} hand`;
            }
            if (i < ev.tosses.length - 1) {
                text += "\n";
            }
        }
    }
    return text;
}

export function stringifyBall(ball: PartialBall): string {
    let text = ball.name;
    if (ball.id !== undefined) {
        text += `(ID : ${ball.id})`;
    }
    return text;
}

export function stringifyHand(hand: PartialBall[]): string {
    let text = "";
    for (const ball of hand) {
        text += `${stringifyBall(ball)}, `;
    }
    return text;
}

// export function stringifyDeque<T>(deque: Deque<T>, stringifyElemFunc: (elem: T) => string): string {
//     let text = "[";
//     for (const elem of deque) {
//         text += stringifyElemFunc(elem);
//     }
//     text += "]";
//     return text;
// }

export function stringifySchedulerEvents(events: [Fraction, SchedulerEvent][]) {
    let text = "";
    for (const [beat, ev] of events) {
        text += `Beat ${stringifyFraction(beat)}`;
        text += "\n\t";
        text += stringifySchedulerEvent(ev).split("\n").join("\n\t");
        text += "\n";
    }
    return text;
}

// Testing
// import { parseMusicalSiteswap } from "../parser/siteswap_mj/MusicalSiteswap";
// const params: ParserToSchedulerParams = {
//     ballNames: new Set(["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do'"]),
//     defaultJugglerName: "NoName",
//     jugglerNames: new Set(["NoName", "Vincent", "Florent"]),
//     // events: parseMusicalSiteswap("3"),
//     // events: parseMusicalSiteswap("L404[Sol4 Do'5]1"),
//     // events: parseMusicalSiteswap("R3 (1x {12} e)^3 (4,[82x]) (1, 0)! L5x 7"),
//     events: parseMusicalSiteswap("{M1B1/4}303{Do B5}{B6/1}{+B2 x}"),
//     // events: parseMusicalSiteswap("LBo3"), //Should Fail
//     startBeat: new Fraction(0),
//     tempo: new Fraction("1"),
//     musicConverter: new MusicBeatConverter([[0, new Fraction("3")]])
// };
// const events = parserToSchedulerEvents(params);
// console.log(stringifySchedulerEvents(events));
