import Fraction from "fraction.js";
import {
    parseMusicalSiteswap,
    ParserJugglingEvent,
    ParserToss,
    ParserTossMode
} from "../parser/siteswap_mj/MusicalSiteswap";
import { MusicBeatConverter } from "./music_beat_converter";
import {
    SchedulerEvent,
    PartialToss,
    PartialTossMode,
    PartialBall,
    FracSortedList,
    isInRhythm,
    XOR,
    FracTimeline
} from "./mj_parser";
import { closestWordsTo } from "./levenshtein_distance";
import { setIntersection } from "../utils/SetOperations";
import { TimedErrorLogger } from "./ErrorLogger";
import { OrderedMap } from "js-sdsl";

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
    ballNames?: Set<string>;
    ballIDs?: Map<string, string>;
    musicConverter?: MusicBeatConverter;
    // events: PreParserEvent[];
    // jugglerNames: Set<string>;
    // jugglerName: string;
}

//Add to Raw -> Not Raw that time can be a Fraction already, or a normal number, or a bigint.

function theWholeThing({ jugglers, ballNames, ballIDs, musicConverter }: ParserToSchedulerParams): {
    events: FracSortedList<SchedulerEvent>;
} {
    // 1. Fill ballNames / ballIDs if they don't exist.
    ({ ballNames, ballIDs } = formatBallNamesAndIDs({ ballNames: ballNames, ballIDs: ballIDs }));
    // 2. Check if ballIDs correctly refer to ballNames and that they aren't duplicates.
    checkBallNamesAndIDs(ballNames, ballIDs);

    const errorLogger = new TimedErrorLogger();
    for (const [jugglerName, events] of jugglers) {
        // 1. Add beat to each pattern event
        // 2. Add tempo + hands to the first if needed.
        const events1 = parsePatterns(events);
        const events2 = fuseDuplicateBeats(events1, errorLogger);
        const events3 = filterEmptyEvents(events2);
        const events4;
        addJugglerNames();
        checkJugglerNames();
        formatBalls();
        formatMode();
        addFromBeat();
        addDefaultHandToAllEvents();
        // addBeatToTosses();
        // checkEventsInRhythm();
        // 3. Sort events.
        // 4. Check no duplicate beat.
        // 4b. Filter empty events.
        // 5. Check events in Rhythm.
        // 5. Check and fill juggler names
        // 6. Check and fill Ball
        // 7. Check and fill Mode.
        // 8. Add Default Hand
    }

    // 8. Filter empty events.
    // 10. Infer.
    return { events: [] };
}

export function compareEvents<T>(ev1: [Fraction, T], ev2: [Fraction, T]) {
    return ev1[0].compare(ev2[0]);
}

function sortEvents<T>(events: FracSortedList<T>): FracSortedList<T> {
    return [...events].sort(compareEvents);
}

// type Pattern = { pattern: string };

type EventT<TossT, HandT> = Partial<NewDefaultHand & Tosses<TossT> & Tempo & Hands<HandT>>;
type Events<EventTT> = FracSortedList<EventTT>;

//TODO : Pass juggler name to help with errorlogger ?
//TODO : ErrorLogger so that if a juggler fails, we can keep going with other juggler.
function parsePatterns(
    events: FracSortedList<PreParserEvent>
): FracSortedList<EventT<ParserToss, string>> {
    const tempoChangesArray: [Fraction, Fraction][] = [];
    for (const [beat, ev] of events) {
        if (ev.tempo !== undefined) {
            tempoChangesArray.push([beat, ev.tempo]);
        }
    }
    if (tempoChangesArray.length === 0) {
        throw Error("No Tempo indication was given. TODO JugglerName");
    }
    const tempoChanges = new FracTimeline(tempoChangesArray);
    const newEvents: FracSortedList<EventT<ParserToss, string>> = [];
    // let lastPatternBeat: Fraction | null = null;
    for (const [beat, ev] of events) {
        let currentBeat = beat;
        if (ev.pattern !== undefined) {
            const patternEvents = parseMusicalSiteswap(ev.pattern);
            // Create an event with no toss that has the tempo and hands information.
            // It will be fused in a later function.
            newEvents.push([beat, { tempo: ev.tempo, hands: ev.hands }]);
            // Fill in each pattern event beat.
            for (const patternEv of patternEvents) {
                newEvents.push([currentBeat, patternEv]);
                let [, tempo] = tempoChanges.prev_event(beat);
                if (tempo === null) {
                    tempo = tempoChanges.begin().pointer[1];
                }
                currentBeat = beat.add(tempo);
            }

            // Warn if a pattern is intertwined with another.
            // if (lastPatternBeat !== null && beat.lte(lastPatternBeat)) {
            //     errorLogger.addError(beat, "Warn", "TODO");
            // }
            // if (lastPatternBeat === null || lastPatternBeat.gt(beat)) {
            //     lastPatternBeat = beat;
            // }
        }
    }
    return sortEvents(newEvents);
}

type Tosses<TossT> = { tosses: TossT[] };
type Tempo = { tempo: Fraction };
type NewDefaultHand = { newDefaultHand: "L" | "R" };

//TODO : Rename newDefaulHand to defaultHand everywhere ?
function fuseDuplicateBeats<TossT, T extends Partial<Tosses<TossT> & Tempo & NewDefaultHand>>(
    events: FracSortedList<T>,
    errorLogger: TimedErrorLogger
): FracSortedList<T> {
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
            const { tosses: tosses1, tempo: tempo1, newDefaultHand: newDefaultHand1 } = ev;
            const {
                tosses: tosses2,
                tempo: tempo2,
                newDefaultHand: newDefaultHand2
            } = newEvents[newEvents.length - 1][1];

            let newTosses: TossT[] | undefined = undefined;
            if (tosses1 !== undefined && tosses2 !== undefined) {
                newTosses = tosses1.concat(tosses2);
            } else {
                newTosses = tosses1 ?? tosses2;
            }

            let newTempo: Fraction | undefined = undefined;
            if (tempo1 !== undefined && tempo2 !== undefined) {
                if (tempo1 !== tempo2) {
                    errorLogger.addError(
                        beat,
                        "Error",
                        "TODO. Two different tempos defined on same beat. Proceeding by taking the first one."
                    );
                }
                newTempo = tempo2;
            } else {
                newTempo = tempo1 ?? tempo2;
            }

            let newNewDefaultHand: "L" | "R" | undefined = undefined;
            if (newDefaultHand1 !== undefined && newDefaultHand2 !== undefined) {
                if (newDefaultHand1 !== newDefaultHand2) {
                    errorLogger.addError(
                        beat,
                        "Error",
                        "TODO. Two different newDefaultHands defined on same beat. Proceeding by taking the first one."
                    );
                }
                newNewDefaultHand = newDefaultHand2;
            } else {
                newNewDefaultHand = newDefaultHand1 ?? newDefaultHand2;
            }

            newEvents[newEvents.length - 1][1] = {
                tosses: newTosses,
                tempo: newTempo,
                newDefaultHand: newNewDefaultHand
            } as T;
        }
    }
    return newEvents;
}

//TODO : Correct Partial/Required Types
//TODO : Make sure empty list events works.
function addTempoToAllEvents<T extends Partial<Tempo>>(
    events: FracSortedList<T>,
    errorLogger: TimedErrorLogger
): FracSortedList<T & Tempo> {
    if (events.length === 0) {
        return [];
    }
    if (events[0][1].tempo === undefined) {
        errorLogger.addError(events[0][0], "CriticalError", "Missing starting tempo indication");
        return [];
    }
    let tempo = events[0][1].tempo;
    const newEvents: FracSortedList<T & Tempo> = [];
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
    errorLogger: TimedErrorLogger
): FracSortedList<T & NewDefaultHand> {
    if (events.length === 0) {
        return [];
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
        if (ev.newDefaultHand !== undefined) {
            lastDefaultHand = ev.newDefaultHand;
        } else {
            const nbSteps = beat.sub(lastBeat).div(lastTempo);
            if (!nbSteps.divisible(1)) {
                //TODO : Handle elsewhere, or gracefully here (by taking next event).
                // errorLogger.addError(beat, "Error", )
                throw Error("TODO");
            }
            lastDefaultHand = XOR(nbSteps.divisible(2), lastDefaultHand === "R") ? "L" : "R";
        }
        newEvents.push([beat, { ...ev, newDefaultHand: lastDefaultHand }]);
        lastBeat = beat;
        lastTempo = ev.tempo;
    }
    return newEvents;
}

function addTossesToAllEvents<TossT, T extends Partial<Tosses<TossT>>>(
    events: FracSortedList<T>
): FracSortedList<T & Tosses<TossT>> {
    const newEvents: FracSortedList<T & Tosses<TossT>> = [];
    for (const [beat, ev] of events) {
        newEvents.push([beat, { ...ev, tosses: ev.tosses ?? [] }]);
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
        const newTosses: TossJuggler[] = [];
        for (const toss of ev.tosses) {
            const toJuggler = toss.to.juggler ?? defaultJugglerName;
            const fromJuggler = toss.from.juggler ?? defaultJugglerName;
            newTosses.push({
                ...toss,
                to: { ...toss.to, juggler: toJuggler },
                from: { ...toss.from, juggler: fromJuggler }
            });
        }
        newEvents.push([beat, { ...ev, tosses: newTosses }]);
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

type BallNameOrID = { ballNameOrID: string };
type BallNameAndID = { name: string; id?: string };
type TossBall<BallT> = { ball: BallT };
type Hands<BallT> = { hands: [BallT[], BallT[]] };

//TODO : Fuse TossBallNameOrId so that it uses field ball in objetc to have one huge printing function.
//TODO : Check that ballIDs values are valid ballNames in another function.
//TODO : Unconsistent way across functions of defining generic type.
function formatThrownBalls<TossT>(
    events: FracSortedList<Tosses<TossT & Partial<TossBall<string>>>>,
    ballNames: Set<string>,
    ballIDs: Map<string, string>,
    errorLogger: TimedErrorLogger
): FracSortedList<Tosses<TossT & Partial<TossBall<BallNameAndID>>>> {
    const newEvents: FracSortedList<Tosses<TossT & Partial<BallNameAndID>>> = [];
    for (const [beat, ev] of events) {
        const newTosses: (TossT & Partial<BallNameAndID>)[] = [];
        for (const toss of ev.tosses) {
            const ball =
                toss.ball === undefined
                    ? undefined
                    : getBall(toss.ball, ballNames, ballIDs, errorLogger, beat);
            newTosses.push({ ...toss, ball: ball });
        }
        newEvents.push([beat, { ...ev, tosses: newTosses }]);
    }
    return newEvents;
}

function getBall(
    ballNameOrID: string | undefined,
    ballNames: Set<string>,
    ballIDs: Map<string, string>,
    errorLogger: TimedErrorLogger,
    beat: Fraction
): { name: string; id?: string } | undefined {
    if (ballNameOrID === undefined) {
        return undefined;
    } else if (ballNames.has(ballNameOrID)) {
        return { name: ballNameOrID };
    } else if (ballIDs.has(ballNameOrID)) {
        // const ballID = toss.ballNameOrID;
        // const ballName = ballIDs.get(toss.ballNameOrID)!;
        // if (!ballNames.has(ballName)) {
        //     errorLogger.addError(beat, "CriticalError", `Ball with ID`)
        // }
        return { name: ballIDs.get(ballNameOrID)!, id: ballNameOrID };
    }
    handleUnkownName(ballNameOrID, [...ballNames, ...ballIDs.keys()], "ball", errorLogger, beat);
    return undefined;
}

function formatHeldBalls<T>(
    events: FracSortedList<T & Partial<Hands<string>>>,
    ballNames: Set<string>,
    ballIDs: Map<string, string>,
    errorLogger: TimedErrorLogger
): FracSortedList<T & Partial<Hands<BallNameAndID>>> {
    const newEvents: FracSortedList<T & Partial<Hands<BallNameAndID>>> = [];
    for (const [beat, ev] of events) {
        let newHands: [BallNameAndID[], BallNameAndID[]] | undefined;
        if (ev.hands !== undefined) {
            newHands = [[], []];
            for (let i = 0; i < 2; i++) {
                for (const ball of ev.hands[i]) {
                    const newBall = getBall(ball, ballNames, ballIDs, errorLogger, beat);
                    if (newBall === undefined) {
                        continue;
                    }
                    newHands[i].push(newBall);
                }
            }
        } else {
            newHands = undefined;
        }
        newEvents.push([beat, { ...ev, hands: newHands }]);
    }
    return newEvents;
}

function handleUnkownName(
    name: string,
    namesList: Iterable<string>,
    nameCategory: string,
    errorLogger: TimedErrorLogger,
    beat: Fraction
): void {
    let text = `Unknown ${nameCategory} : "${name}".`;
    const closeMatches = closestWordsTo(name, namesList, 2);
    if (closeMatches.length > 0) {
        text += ` Did you mean "${closestWordsTo(name, namesList, 2)}" ?`;
    }
    errorLogger.addError(beat, "CriticalError", text);
}

function filterEmptyEvents<T extends SchedulerEvent>(events: FracSortedList<EventT<T>): FracSortedList<T> {
    // Static function to filter tosses.
    function keepToss(toss: PartialToss): boolean {
        return (
            (toss.to.mode === "Height" && toss.to.height > 0) ||
            (toss.to.mode === "Beat" && toss.to.beat.gt(toss.from.beat))
        );
    }

    // Remove events with no usefull toss and other information.
    const newEvents: FracSortedList<T> = [];
    let lastTempo: Fraction | null = null;
    for (const [beat, ev] of events) {
        const newTosses = ev.tosses?.filter(keepToss);
        if (
            !(
                (newTosses === undefined || newTosses.length === 0) &&
                (ev.tempo === undefined || lastTempo?.equals(ev.tempo)) &&
                ev.newDefaultHand === undefined &&
                ev.hands === undefined
            )
        ) {
            newEvents.push([beat, { ...ev, tosses: newTosses }]);
        }
        lastTempo = ev.tempo ?? lastTempo;
    }
    return newEvents;
}

function formatMode<TossT>(
    events: FracSortedList<Tosses<TossT & ParserTossMode>>,
    errorLogger: TimedErrorLogger,
    musicConverter?: MusicBeatConverter
): FracSortedList<Tosses<TossT & PartialTossMode>> {
    const newEvents: FracSortedList<Tosses<TossT & PartialTossMode>> = [];
    for (const [beat, ev] of events) {
        const newTosses: (TossT & PartialTossMode)[] = [];
        for (const toss of ev.tosses) {
            let mode: PartialTossMode;
            if (toss.mode === "Height") {
                mode = { mode: "Height", height: toss.height };
            } else if (toss.mode === "AbsBeat") {
                mode = { mode: "Beat", beat: toss.beat };
            } else if (toss.mode === "AbsMeasureBeat") {
                if (musicConverter === undefined) {
                    errorLogger.addError(
                        beat,
                        "CriticalError",
                        "No Signature information was provided to be able to use measures. TODO."
                    );
                    continue;
                }
                mode = {
                    mode: "Beat",
                    beat: musicConverter.convertMeasureBeat(toss.measureBeat)
                };
            } else {
                mode = { mode: "Beat", beat: beat.add(toss.beat) };
            }
            newTosses.push({ ...toss, ...mode });
        }
        newEvents.push([beat, { ...ev, tosses: newTosses }]);
    }
    return newEvents;
}

//TODO : Mode loop / loops out of the way into main function if possible !
// function checkEventsInRhythm<TossT extends Tempo, T extends Tosses<TossT>>(events: FracSortedList<T>, errorLogger: TimedErrorLogger): FracSortedList<T> {
//     const newEvents: FracSortedList<T> = [];
//     for (const [beat, ev] of events) {
//         if ()
//     }

// }

function checkBallNamesAndIDs(ballNames: Set<string>, ballIDs: Map<string, string>): void {
    const inter = setIntersection(ballNames, new Set(ballIDs.keys()));
    let text = "";
    if (inter.size > 0) {
        for (const name of inter) {
            text += `Ball ${name} is both a name and an ID.\n`;
        }
    }
    for (const [ballID, ballName] of ballIDs) {
        if (!ballNames.has(ballName)) {
            text += `Ball with ID ${ballID} has unknown ball name ${ballName}.\n`;
        }
    }
    if (text !== "") {
        throw Error(text);
    }
}

function formatBallNamesAndIDs({
    ballNames,
    ballIDs
}: {
    ballNames?: Set<string>;
    ballIDs?: Map<string, string>;
}): { ballNames: Set<string>; ballIDs: Map<string, string> } {
    if (ballNames === undefined) {
        ballNames = new Set(ballIDs !== undefined ? ballIDs.values() : []);
    }
    if (ballIDs === undefined) {
        ballIDs = new Map();
    }
    return { ballNames: ballNames, ballIDs: ballIDs };
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
