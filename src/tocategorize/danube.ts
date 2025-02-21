import Fraction from "fraction.js";
import { Ball, BallsInHands, FracSortedList, SchedulerEvent } from "./mj_parser";
import { Deque } from "js-sdsl";
import { MusicBeatConverter, MusicTime } from "./music_beat_converter";
import { parseMusicalSiteswap, ParserJugglingEvent } from "../parser/siteswap_mj/MusicalSiteswap";
import { parserToSchedulerEvents } from "./parser_to_scheduler";
import { closestWordsTo } from "./levenshtein_distance";

//TODO : namespaces ?
//TODO : Move all custom functions from this file.
//TODO : In partial Event, tosses may be undefined

function formatJugglerBalls(
    commonBallNames: string[],
    jugglersSpecificBallNames: { name: string; ballNames: string[] }[]
): { name: string; balls: Ball[] }[] {
    const jugglerBalls: { name: string; balls: Ball[] }[] = [];
    for (const { name: jugglerName, ballNames: specificBallNames } of jugglersSpecificBallNames) {
        const balls: Ball[] = [];
        for (const ball of [...commonBallNames, ...specificBallNames]) {
            balls.push({ name: ball, id: ball + "?" + jugglerName });
        }
        jugglerBalls.push({ name: jugglerName, balls: balls });
    }
    return jugglerBalls;
}

function parseTime(time: string): Fraction | MusicTime {
    const numbers = time.split(",");
    if (numbers.length < 1 || numbers.length > 2) {
        throw Error(`Can't understand provided time : ${time}`);
    }
    if (numbers.length === 1) {
        return new Fraction(numbers[0]);
    }
    return [parseInt(numbers[0]), new Fraction(numbers[0])];
}

//TODO : add beat to the object rather than have a 2-array element.
//TODO : useHand ?
type RawEventInput = {
    tempo?: string;
    hands?: [string[], string[]];
    pattern?: string /*; useHand?: "L" | "R" */;
};
type EventInput = {
    tempo?: Fraction;
    hands?: [string[], string[]];
    pattern?: string /*; useHand?: "L" | "R" */;
};

//TODO : Use ErrorHandler ?
function formatRawEventInput(
    events: RawEventInput[],
    musicConverter?: MusicBeatConverter
): EventInput[] {
    const formattedEvents: EventInput[] = [];
    for (const [rawTime, rawEv] of events) {
        let time = parseTime(rawTime);
        if (Array.isArray(time)) {
            if (musicConverter === undefined) {
                throw Error("No Signature information was provided to be able to use measures");
            }
            time = musicConverter.convertMeasureBeat(time);
        }
        const tempo = rawEv.tempo === undefined ? undefined : new Fraction(rawEv.tempo);
        formattedEvents.push([time, { ...rawEv, tempo: tempo }]);
    }
    return formattedEvents;
}

//TODO : Rename
export interface ParserToSchedulerParams {
    events: InputEvent[];
    jugglerNames: Set<string>;
    jugglerName: string;
    ballNames: Set<string>;
    ballIDs: Map<string, string>;
    musicConverter?: MusicBeatConverter;
}

//TODO Rename
function theWholeThing({
    events,
    jugglerNames,
    jugglerName,
    ballNames,
    ballIDs,
    musicConverter
}: ParserToSchedulerParams): { events: FracSortedList<SchedulerEvent> } {
    const events2 = formatRawEventInput(events);
    const events3 = formatEventPatterns(events2);

    // 1. Add beat to each pattern event
    // 2. Add tempo + hands to the first if needed.
    // 3. Already store tempo cache info ?
    // 4. Check no duplicate beat.
    // 4b. Check events in Rhythm.
    // 5. Check and fill juggler names
    // 6. Check and fill Ball
    // 7. Check and fill Mode.
    // 8. Filter empty events.
    // 9. Cache in information about tempo / hands.
    // 10. Infer.
    return { events: [] };
}

type Event3 = ParserJugglingEvent & { tempo: Fraction; hands: [string[], string[]] };

function formatEventPatterns(
    events: FracSortedList<EventInput>,
    musicConverter?: MusicBeatConverter
): FracSortedList<Event3> {
    // Check if there is a starting tempo. TODO. + TODO Not necessariliy sorted yet ?

    const newEvents: FracSortedList<Event2> = []; //TODO Type
    for (const [beat, ev] of events) {
        if (ev.tempo !== undefined) {
            tempo = ev.tempo;
        }
        if (ev.pattern !== undefined) {
            const patternEvents = parseMusicalSiteswap(ev.pattern);
            for (const patternEv of patternEvents) {
            }
        }
    }
    return newEvents;
}

type Event2 = EventInput & { tempo: Fraction };

type Tempo = { tempo?: Fraction };

function addTempoToAllEvents<T extends Partial<Tempo>>(
    events: FracSortedList<T>
): FracSortedList<T & Tempo> {
    if (events.length === 0 || events[0][1].tempo === undefined) {
        // this.logError(events[0][0], "CriticalError", "Missing starting tempo indication");
        throw Error("Missing starting tempo indication.");
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

type DefaultHand = { newDefaultHand: "L" | "R" };

function addDefaultHandToAllEvents<T extends Partial<DefaultHand>>(
    events: FracSortedList<T>
): FracSortedList<T & DefaultHand> {
    return [];
}

function fillAndCheckJugglerNames<
    FromT extends { juggler?: string },
    ToT extends { juggler?: string },
    T extends { from?: FromT; to?: ToT }
>(
    events: FracSortedList<T>,
    defaultJugglerName: string
): FracSortedList<T & { from: { juggler: string }; to: { juggler: string } }> {
    const newEvents: FracSortedList<T & { from: { juggler: string }; to: { juggler: string } }> =
        [];
    for (const [beat, ev] of events) {
        let from: FromT & { juggler: string };
        let to: ToT & { juggler: string };
        if (ev.from === undefined) {
        }
        if (toss.toJuggler !== undefined && !jugglerNames.has(toss.toJuggler)) {
            handleUnkownName(toss.toJuggler, jugglerNames, "juggler");
        }
        return toss.toJuggler ?? defaultJugglerName;
    }
}

function handleUnkownName(name: string, namesList: Iterable<string>, nameCategory: string): void {
    let text = `Unknown ${nameCategory} : "${name}".`;
    const closeMatches = closestWordsTo(name, namesList, 2);
    if (closeMatches.length > 0) {
        text += ` Did you mean "${closestWordsTo(name, namesList, 2)}" ?`;
    }
    throw Error(text);
}

//Danube

const commonBallNames = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do'"];

const specificBallNames = [
    { name: "Vincent", ballNames: [] },
    { name: "Florent", ballNames: ["Fa#, Mi'"] }
];

const jugglers = formatJugglerBalls(commonBallNames, specificBallNames);

//TODO const musicMeasures

/* eslint-disable */
// prettier-ignore
const patternVincent: [
    string,
    { tempo?: string; hands?: [string[], string[]]; pattern?: string }
][] = [
    ["-1, 2", { tempo: "1/4", hands: [["Do", "Mi"], ["Sol"]], pattern: "L40441001" }],
    ["3, 2", { hands: [["Do", "Mi"], ["Sol"]], pattern: "L40441001" }],
    ["7, 2", { hands: [["Re", "Fa"], ["La"]], pattern: "L40441001" }],
    ["11, 2", { hands: [["Re", "Fa"], ["La"]], pattern: "L40441001" }],
    ["15, 2", { hands: [["Do", "Mi"], ["Sol", "Do'"]], pattern: "L404[Sol4Do'R]" }],
    ["19, 2", { hands: [["Do", "Mi"], ["Sol", "Do'"]], pattern: "L404[Sol4Do'R]" }],
    ["23, 2", { hands: [["Re", "Fa"], ["La"]], pattern: "L40441001" }],
    ["28, 3", { hands: [["Re"], ["Do'"]], pattern: "R2201" }],
    ["31, 3", { hands: [["Do"], []], pattern: "L1" }],
    ["32, 1", { tempo: "1/8", pattern: "11" }],
    ["32, 2", { tempo: "1/4", pattern: "1"}],
]

// prettier-ignore
const patternFlorent: [
    string,
    { tempo?: string; hands?: [string[], string[]]; pattern?: string }
][] = [
    ["1, 3", { tempo: "1/4", hands: [["Mi"], ["Sol"]], pattern: "R3501001" }],
    ["5, 3", { hands: [["Fa"], ["Sol"]], pattern: "R3501001" }],
    ["9, 3", { hands: [["Fa"], ["La"]], pattern: "R3501001" }],
    ["13, 3", { hands: [["Mi"], ["La"]], pattern: "R3501001" }],
    ["17, 3", { hands: [["Sol"], ["Do'"]], pattern: "R3501001" }],
    ["21, 3", { hands: [["La"], ["Do'"]], pattern: "R3501001" }],
    ["26, 2", { hands: [["Fa#", "Mi'"], ["Sol"]], pattern: "L(3^3)" }],
    ["29, 2", { hands: [["La", "Do"], ["Re", "Sol"]], pattern: "R445x5x" }],
]
/* eslint-enable */

function simulate();
