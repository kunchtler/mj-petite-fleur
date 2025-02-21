import Fraction from "fraction.js";
import {
    parseMusicalSiteswap,
    ParserJugglingEvent,
    ParserToss,
    stringifyFraction
} from "../parser/siteswap_mj/MusicalSiteswap";
import { MusicBeatConverter } from "./music_beat_converter";
import {
    SchedulerEvent,
    PartialToss,
    PartialTossMode,
    PartialBall,
    FracSortedList,
    isInRhythm,
    XOR
} from "./mj_parser";
import { closestWordsTo } from "./levenshtein_distance";
import { setIntersection } from "../utils/SetOperations";
import { TimedErrorLogger } from "./ErrorLogger";

//TODO : add beat to the object rather than have a 2-array element.
//TODO : useHand ?
type RawPreParserEvent = {
    tempo?: string;
    hands?: [string[], string[]];
    pattern?: string /*; useHand?: "L" | "R" */;
};

type PreParserEvent = {
    tempo?: Fraction;
    hands?: [string[], string[]];
    pattern?: string /*; useHand?: "L" | "R" */;
};

//TODO : Rename
//TODO : Rename InputEvent as part of MDN.
export interface ParserToSchedulerParams {
    jugglers: Map<string, FracSortedList<PreParserEvent>>;
    ballNames: Set<string>;
    ballIDs: Map<string, string>;
    musicConverter?: MusicBeatConverter;
    // events: PreParserEvent[];
    // jugglerNames: Set<string>;
    // jugglerName: string;
}

//Add to Raw -> Not Raw that time can be a Fraction already, or a normal number, or a bigint.

function theWholeThing({ jugglers, ballNames, ballIDs, musicConverter }: ParserToSchedulerParams): {
    events: FracSortedList<SchedulerEvent>;
} {
    const errorLogger = new TimedErrorLogger();
    for (const [jugglerName, events] of jugglers) {
        events.sort((ev1, ev2) => ev1[0].compare(ev2[0]));
        // 1. Add beat to each pattern event
        // 2. Add tempo + hands to the first if needed.
        const events0 = sortEvents(events);
        const events1 = parsePatterns(events, errorLogger);
        const events1b = addBeatToTosses();
        // 3. Sort events.
        const events2 = sortEvents(events1);
        // 4. Check no duplicate beat.
        const events3 = fuseDuplicateBeats(events2, errorLogger);
        // 5. Check events in Rhythm.
        const events4 = checkEventsInRhythm(events3);
        // 5. Check and fill juggler names
        const events5 = addJugglerNames(events4);
        const events6 = checkJugglerNames(events5);
        // 6. Check and fill Ball
        const events7 = formatBalls(events6);
        // 7. Check and fill Mode.
        const events8 = formatMode(events7);
        // 8. Add.
    }

    // 3. Already store tempo cache info ?
    // 8. Filter empty events.
    // 10. Infer.
    return { events: [] };
}

//Rename param ?
function compareEvents<T>(ev1: [Fraction, T], ev2: [Fraction, T]) {
    return ev1[0].compare(ev2[0]);
}

function sortEvents<T>(events: FracSortedList<T>): FracSortedList<T> {
    return [...events].sort(compareEvents);
}

type Pattern = {pattern: string};

//TODO : Type
function parsePatterns<T extends Partial<Pattern>>(events: FracSortedList<T>, errorLogger: TimedErrorLogger): any {
    const newEvents: FracSortedList<T> = [];
    let biggestBeat: Fraction | undefined;
    for (const [beat, ev] of events) {
        if (ev.pattern !== undefined) {
            const patternEvents = parseMusicalSiteswap(ev.pattern);
            // This condition is met if a pattern is so big another event happens before it ends, which is probably unwanted.
            if (biggestBeat !== undefined && beat.lte(biggestBeat)) {
                errorLogger.addError(beat, "Warn", "TODO");
            }
            for (const ev of patternEvents) {
                //TODO
                newEvents.push([beat, {...ev, tosses: }])
            }
            if (biggestBeat === undefined || biggestBeat.gt(beat))
        }
    }
}

type Tosses<TossT> = { tosses: TossT[] };
type Tempo = { tempo: Fraction };
type NewDefaultHand = { newDefaultHand: "L" | "R"}

//TODO : Rename newDefaulHand to defaultHand everywhere ?
function fuseDuplicateBeats<TossT, T extends Partial<Tosses<TossT> & Tempo & NewDefaultHand>>(events: FracSortedList<T>, errorLogger: TimedErrorLogger): FracSortedList<T> {
    if (events.length === 0) {
        return [];
    }
    events = sortEvents(events);
    const newEvents: FracSortedList<T> = [events[0]];
    for (let i = 1; i < events.length; i++) {
        const [beat, ev] = events[i];
        if (!newEvents[newEvents.length - 1][0].equals(beat)) {
            newEvents.push([beat, ev]);
        } else {
            const {tosses: tosses1, tempo: tempo1, newDefaultHand: newDefaultHand1} = ev;
            const {tosses: tosses2, tempo: tempo2, newDefaultHand: newDefaultHand2} = newEvents[newEvents.length - 1][1];
            
            let newTosses: TossT[] | undefined = undefined;
            if (tosses1 !== undefined && tosses2 !== undefined) {
                newTosses = tosses1.concat(tosses2);
            } else {
                newTosses = tosses1 ?? tosses2;
            }
            
            let newTempo: Fraction | undefined = undefined;
            if (tempo1 !== undefined && tempo2 !== undefined) {
                if (tempo1 !== tempo2) {
                    errorLogger.addError(beat, "Error", "TODO. Two different tempos defined on same beat. Proceeding by taking the first one.");
                }
                newTempo = tempo2;
            } else {
                newTempo = tempo1 ?? tempo2;
            }
            
            let newNewDefaultHand: "L" | "R" | undefined = undefined;
            if (newDefaultHand1 !== undefined && newDefaultHand2 !== undefined) {
                if (newDefaultHand1 !== newDefaultHand2) {
                    errorLogger.addError(beat, "Error", "TODO. Two different newDefaultHands defined on same beat. Proceeding by taking the first one.");
                }
                newNewDefaultHand = newDefaultHand2;
            } else {
                newNewDefaultHand = newDefaultHand1 ?? newDefaultHand2;
            }

            newEvents[newEvents.length - 1][1] = {tosses: newTosses, tempo: newTempo, newDefaultHand: newNewDefaultHand} as T;
        }
    }
    return newEvents;
}

//TODO : Correct Partial/Required Types
//TODO : Make sure empty list events works.
function addTempoToAllEvents<T extends Partial<Tempo>>(
    events: FracSortedList<T>,
    errorLogger: TimedErrorLogger;
): FracSortedList<T & Tempo> {
    if (events.length === 0) {
        return [];
    }
    if (events[0][1].tempo === undefined) {
        errorLogger.addError(
            events[0][0],
            "CriticalError",
            "Missing starting tempo indication"
        );
        return [];
    }
    let tempo = events[0][1].tempo;
    const newEvents: FracSortedList<T & { tempo: Fraction }> = []; //TODO Type
    for (const [beat, ev] of events) {
        if (ev.tempo !== undefined) {
            tempo = ev.tempo;
        }
        newEvents.push([beat, { ...ev, tempo: tempo }]);
    }
    return newEvents;
}

//Rename TimedErrorLogger.logError/addError method. Misleading name.
function addDefaultHandToAllEvents<T extends Partial<NewDefaultHand> & Tempo>(
    events: FracSortedList<T>,
    errorLogger: TimedErrorLogger;
): FracSortedList<T & NewDefaultHand> {
    if (events.length === 0) {
        return []
    }
    let lastDefaultHand: "L" | "R";
    if (events[0][1].newDefaultHand === undefined) {
        errorLogger.addError(
            events[0][0],
            "Warn",
            `No starting hand detected. Assumes TODO will start with their right hand.`
        );
        lastDefaultHand = "R";
    } else {
        lastDefaultHand = events[0][1].newDefaultHand;
    }
    let lastBeat = events[0][0];
    let lastTempo = events[0][1].tempo;
    const newEvents: FracSortedList<T & NewDefaultHand> = [];
    for (const [beat, ev] of events) {
        // TODO : Elsewhere.
        // 1. Check if event is on rhythm nice and dandy.
        // if (!isInRhythm(beat, lastBeat, ev.tempo)) {
        //     const nbSteps = beat.sub(lastBeat).div(ev.tempo).floor();
        //     const prevBeat = beat.add(ev.tempo).mul(nbSteps);
        //     errorLogger.addError(
        //         beat,
        //         "Error",
        //         `An event happens offbeat.\n$TODO's previous beat: ${prevBeat.toString()}.\nTempo: ${stringifyFraction(ev.tempo)}.\nEvent's beat: ${beat.toString()}.`
        //     );
            //TODO : Check if alright ?
        // }
        let defaultHand: "L" | "R";
        if (ev.newDefaultHand !== undefined) {
            defaultHand = ev.newDefaultHand;
        } else {
            const nbSteps = beat.sub(lastBeat).div(ev.tempo);
            if (!nbSteps.divisible(1)) {
                //TODO : Handle elsewhere, or gracefully here (by taking next event).
                // errorLogger.addError(beat, "Error", )
                throw Error("TODO");
            }
            lastDefaultHand = XOR(nbSteps.divisible(2), lastDefaultHand === "R") ? "L" : "R";
        }
        newEvents.push([beat, {...ev, newDefaultHand: lastDefaultHand}]);
        lastBeat = beat;
        lastTempo = ev.tempo;
    }
    return newEvents;
}

function addTossesToAllEvents<TossT, T extends Partial<Tosses<TossT>>> (events: FracSortedList<T>): FracSortedList<T & Tosses<TossT>> {
    const newEvents: FracSortedList<T & Tosses<TossT>> = []
    for (const [beat, ev] of events) {
        newEvents.push([beat, {...ev, tosses: ev.tosses ?? []}]);
    }
    return newEvents;
}

export type DeepRequired<T> = {
    [K in keyof T]: Required<DeepRequired<T[K]>>;
};
export type DeepPartial<T> = {
    [K in keyof T]: Partial<DeepPartial<T[K]>>;
};

type TossJuggler = { to: { juggler: string }; from: { juggler: string } };

//TODO : tosses empty list at some point instead of undefined ?
function addMissingJugglerNames<TossT extends DeepPartial<TossJuggler>, T extends Tosses<TossT>>(
    events: FracSortedList<T>,
    defaultJugglerName: string
): FracSortedList<T & Tosses<TossJuggler>> {
    const newEvents: FracSortedList<T & Tosses<TossJuggler>> = [];
    for (const [beat, ev] of events) {
        const newTosses: TossJuggler[] = []
        for (const toss of ev.tosses) {
            const toJuggler = toss.to.juggler ?? defaultJugglerName;
            const fromJuggler = toss.from.juggler ?? defaultJugglerName;
            newTosses.push({...toss, to: {...toss.to, juggler: toJuggler}, from: {...toss.from, juggler: fromJuggler}})
            }
        newEvents.push([beat, {...ev, tosses: newTosses}])
    }
    return newEvents;
}

function checkJugglerNames<TossT extends TossJuggler, T extends Tosses<TossT>>(
    events: FracSortedList<T>,
    jugglerNames: Set<string>,
    errorLogger: TimedErrorLogger
): void {
    for (const [beat, ev] of events) {
        for (const toss of ev.tosses) {
            if (!jugglerNames.has(toss.from.juggler)) {
                handleUnkownName(toss.from.juggler, jugglerNames, "juggler", errorLogger, beat);
            }
            if (!jugglerNames.has(toss.to.juggler)) {
                handleUnkownName(toss.to.juggler, jugglerNames, "juggler", errorLogger, beat);
            }
        }
    }
}

//TODO : Her copy the code that identifies the ball as name or id.
function IdentifyBallNames<TossT extends TossBall, T extends Tosses<TossT>>(
    events: FracSortedList<T>,
    jugglerNames: Set<string>,
    errorLogger: TimedErrorLogger
): void {
    for (const [beat, ev] of events) {
        for (const toss of ev.tosses) {
            if (!jugglerNames.has(toss.from.juggler)) {
                handleUnkownName(toss.from.juggler, jugglerNames, "juggler", errorLogger, beat);
            }
            if (!jugglerNames.has(toss.to.juggler)) {
                handleUnkownName(toss.to.juggler, jugglerNames, "juggler", errorLogger, beat);
            }
        }
    }
}



// export interface ParserToSchedulerParams {
//     events: ParserJugglingEvent[];
//     jugglerNames: Set<string>;
//     defaultJugglerName: string;
//     startBeat: Fraction;
//     tempo: Fraction;
//     ballNames?: Set<string>;
//     ballIDs?: Map<string, string>;
//     musicConverter?: MusicBeatConverter;
// }

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

function handleUnkownName(name: string, namesList: Iterable<string>, nameCategory: string, errorLogger: TimedErrorLogger, beat: Fraction) {
    let text = `Unknown ${nameCategory} : "${name}".`;
    const closeMatches = closestWordsTo(name, namesList, 2);
    if (closeMatches.length > 0) {
        text += ` Did you mean "${closestWordsTo(name, namesList, 2)}" ?`;
    }
    errorLogger.addError(beat, "CriticalError", text);
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
            ev.tempo === undefined &&
            ev.newDefaultHand === undefined &&
            ev.hands === undefined
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
        ev.hands === undefined &&
        ev.tempo === undefined
    ) {
        return "Empty Event.";
    }
    let text = "";
    if (ev.newDefaultHand !== undefined) {
        text += `New default hand: ${ev.newDefaultHand}\n`;
    }
    if (ev.tempo !== undefined) {
        text += `Tempo Change: ${stringifyFraction(ev.tempo)}\n`;
    }
    if (ev.hands !== undefined) {
        text += `New balls in hand: Left${stringifyHand(ev.hands[0])} Right${stringifyHand(ev.hands[1])} \n`;
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
