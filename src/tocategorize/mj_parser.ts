import { Deque, OrderedMapIterator } from "js-sdsl";
import { Timeline } from "../simulator/Timeline";
import Fraction from "fraction.js";

/*
The time between two tosses / catches of the juggler is called its unit
siteswap time. The number of tosses / catches par a certain amount of time
is called a juggler's tempo, which is inversely proportional to its unit
time. This tempo may change over the course of a show.

Since we consider jugglers playing alongside a music, we don't directly
specify a juggler's tempo, but rather, based on the music sheet of a
performance, on how much time a unit time takes as beats (or note values).
We call this the unit value. For that, we use the same conventions as
music signature. For instance, a unit time of 3/8 implies that the unit
time takes 3 (the numerator) eighth notes (the denominator).

This means that at fixed unit time, if the tempo of the music changes,
the tempo of the juggler will also change. This makes sense as jugglers
will want to follow the music, and if it accelerates, they very well may
follow suit. If this is undesired, the unit value should be changed in
the juggling pattern's data.
*/

// function findSorted<T>(array: T[], elem: T): number {
//     if (array.length < 100) {
//         return array.indexOf(elem);
//     }
// }

//TODO : Replace all [Fraction, event][] by this ?
type SortedList<T> = T[];
type FracSortedList<T> = SortedList<[Fraction, T]>;

//TODO : Handle x when throwing to another juggler.

export class FracTimeline<EventType> extends Timeline<Fraction, EventType> {
    static cmp = (x: Fraction, y: Fraction) => x.compare(y);
    constructor(container?: [Fraction, EventType][]) {
        super(container, FracTimeline.cmp);
    }
}

export interface Ball {
    name: string;
    id: string;
}

export interface PartialBall {
    name: string;
    id?: string;
}

//TODO : toss.to.juggler => toss.to.name ?
//TODO : Rename or add namesapces.
//TODO : Errors or console.log ?
export interface PartialToss {
    from: { juggler: string; hand?: "R" | "L"; beat: Fraction };
    to: {
        juggler: string;
        hand?: "R" | "L" | "x";
    } & PartialTossMode;
    ball?: PartialBall;
}

export type PartialTossMode = { mode: "Beat"; beat: Fraction } | { mode: "Height"; height: number };

export interface BallsInHands {
    rightHand: Ball[];
    leftHand: Ball[];
}

export interface PartialBallsInHands {
    rightHand: PartialBall[];
    leftHand: PartialBall[];
}
// TODO: Rename
export interface PartialToss2 {
    from: { juggler: string; rightHand: boolean; beat: Fraction };
    to: { juggler: string; hand?: "R" | "L" | "x"; beat: Fraction };
    ball: Ball;
}

// TODO : Rename to Toss ?
export interface SimulatorToss {
    from: { juggler: string; rightHand: boolean; beat: Fraction };
    to: { juggler: string; rightHand: boolean; beat: Fraction };
    ball: Ball;
}

export interface SchedulerEvent {
    tosses?: PartialToss[];
    tempoChange?: Fraction;
    ballsInHands?: PartialBallsInHands;
    newDefaultHand?: "L" | "R";
}

export interface SchedulerCompletedEvent {
    tosses?: PartialToss[];
    tempo: Fraction;
    ballsInHands?: BallsInHands;
}

//TODO : Fix
export interface SimulatorEvent {
    tosses?: SimulatorToss[];
    tempoChange?: Fraction;
    ballsSwap?: BallsInHands;
    newDefaultHand?: "L" | "R";
}

export type SchedulerEvents = [Fraction, SchedulerEvent][];
export type SimulatorEvents = [Fraction, SimulatorEvent][];

//Ball Name -> Time until caught
//TODO : Create custom errors for Jugglers and scheduler.
export class SchedulerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SchedulerError";
    }
}

// interface PatternReturn {name: string, states: JugglerState}

//TODO : Document that by default hands have LIFO structure.
//TODO : Make Generic version for the fun of it ?
//TODO : Rename partialEvents (clashes with JS events ?)
//TODO : Fail Gracefully
//TODO : Document that events param in constructor won't be copied and thus that it can be used to modify
// The search directly ? Or do proper method ?
export class Scheduler {
    jugglers: Map<string, JugglerManager>;

    constructor(
        jugglers: { name: string; balls: PartialBall[]; events: FracTimeline<SchedulerEvent> }[]
    ) {
        this.jugglers = new Map();
        for (const { name, balls, events } of jugglers) {
            this.jugglers.set(name, new JugglerManager(name, balls, events));
        }
    }

    reachedEnd(): boolean {
        let allEnded = true;
        for (const juggler of this.jugglers.values()) {
            allEnded &&= juggler.reachedEnd();
        }
        return allEnded;
    }

    //TODO : Handle errors.
    //TODO : Add arguments from / to ?
    //TODO : Add Return type.
    validatePattern(): {
        isValid: boolean;
        tosses: SimulatorToss[];
        states: Map<string, FracTimeline<JugglerState>>;
    } {
        let failedAcc = false;
        // let failedCritical = false;
        const completedTosses: SimulatorToss[] = [];
        while (!this.reachedEnd() /*|| !failedCritical*/) {
            // Figure out when the closest next beat is from amongst all jugglers.
            let closestNextBeat: Fraction | undefined = undefined;
            let nextBeatJugglers: string[] = [];
            for (const [name, juggler] of this.jugglers) {
                //TODO : Rename this method ?
                const beat = juggler.nextBeatToProcess();
                if (closestNextBeat === undefined || beat.lt(closestNextBeat)) {
                    closestNextBeat = beat;
                    nextBeatJugglers = [name];
                } else if (beat.equals(closestNextBeat)) {
                    nextBeatJugglers.push(name);
                }
            }

            // For all concerned jugglers, process a step and gather the balls they toss.
            // In case a juggler fails, return early.
            const tossedTo = new Map<string, PartialToss2[]>();
            for (const name of this.jugglers.keys()) {
                tossedTo.set(name, []);
            }

            for (const name of nextBeatJugglers) {
                const juggler = this.jugglers.get(name)!;
                const { failed, tosses } = juggler.processBeat();
                failedAcc ||= failed;
                for (const toss of tosses) {
                    tossedTo.get(name)!.push(toss);
                }
            }

            // Send the tossed ball to all needed jugglers.
            for (const [name, juggler] of this.jugglers) {
                const partialTosses = tossedTo.get(name)!;
                const { failed, tosses } = juggler.receiveTosses(partialTosses);
                failedAcc ||= failed;
                completedTosses.push(...tosses);
            }

            // Signal the concerned jugglers that this beat has been processed.
            for (const name of nextBeatJugglers) {
                const juggler = this.jugglers.get(name)!;
                juggler.advanceState();
            }
        }

        // Creates the returned states.
        const states = new Map<string, FracTimeline<JugglerState>>();
        for (const [name, juggler] of this.jugglers) {
            states.set(name, structuredClone(juggler.getKnownStates()));
        }
        return {
            isValid: !failedAcc /*&& !failedCritical*/,
            tosses: completedTosses,
            states: states
        };
    }
}

//TODO : Methods that have no side effect statr with "get".
//TODO : Hash/Equality sketchy with map and set and objects.
interface JugglerState {
    airborne: Map<
        string,
        {
            toRightHand?: boolean;
            ball: Ball;
            // remainingBeats: Fraction;
            catchBeat: Fraction;
            // remainingSteps: number;
        }
    >;
    held: BallsInHands;
    onTable: Map<string, Ball>;
    // useRightHand: boolean;
}

interface BeatInfo {
    state?: JugglerState;
    tempo: Fraction;
    newDefaultHand: "L" | "R";
}

interface EventCache {
    tempo: Fraction;
    isNewHandRight: boolean;
}

type SchedulerEvent2 = SchedulerEvent & { cache: EventCache };

type Severity = "Log" | "Warn" | "Error" | "CriticalError";
type ErrorLog = [Severity, string];

class ErrorTimedLogger<Time> extends Map<Time, ErrorLog[]> {
    addError(time: Time, error: ErrorLog): void {
        let existingErrors = this.get(time);
        if (existingErrors === undefined) {
            existingErrors = [];
            this.set(time, existingErrors);
        }
        existingErrors.push(error);
    }

    sortErrors(compare: (t1: Time, t2: Time) => number): [Time, ErrorLog[]][] {
        return [...this.entries()].sort((entry1, entry2) => compare(entry1[0], entry2[0]));
    }
}

export function isInRhythm(beat: Fraction, startBeat: Fraction, tempo: Fraction): boolean {
    return beat.sub(startBeat).divisible(tempo);
}

export function XOR(a: boolean, b: boolean): boolean {
    return a !== b;
}

//TODO : Fuse "beat" with BeatInfo / State ? to avoid events[0][0/1] ? YES URGENT ?
//TODO : Comment properties use.
//TODO : Clean interfaces
//TODO : For juggling, names Signature / Tempo ?
//TODO : Check that works if events is empty.
//TODO : Rename "Events" => "Event" NO, CLASH WITH JS, BETTER NAME.
//TODO : Rename 'Tempo' => "unit value"
//TODO : Rename 'beats' => "states" ?
//TODO : Array instead of timeline at some points ?
//TODO : ErrorLogger !
class JugglerManager {
    name: string;
    events: FracSortedList<SchedulerEvent2>;
    beats: FracSortedList<JugglerState>;
    errorLogger: ErrorTimedLogger<Fraction>;
    // private _currentTempo: Fraction;
    private _currentState: JugglerState;
    // private _currentBeatIdx: number;
    // private _currentBeat: Fraction;
    private _nextEventIdx: number;
    private _hasProcessedFirstBeat = false;

    //TODO : FOr the packages in pnpm, if they have modular install, use it !
    //TODO : JSSDSL Deque quit complex... create custom class that is easier (as deques are little ?)
    //TODO : When only siteswap height 3 was given, should we deafult to:
    //TODO : Document that currentbeat : state does not exist yet. But info on tempo and usehand might ! Misleading name ?
    // - 3 beats (even if the tempo then gets shorter ?)
    // - 3 * current unit value (possibly falling outside of rhythm)
    // FIRST ANSWER, reason : to keep the symbolic of the height (hand changing etc)
    //+ Easier to understand in practice (number of actions done before catching it).
    //TODO: Reorder constructor code.
    constructor(name: string, ballsOnTable: Ball[], events: FracSortedList<SchedulerEvent>) {
        this.name = name;
        this.events = this.pretreatEvents(events);
        this.beats = [];
        this._nextEventIdx = 0;
        // this._currentBeatIdx = 0;
        this.errorLogger = new ErrorTimedLogger();
        this._currentState = {
            airborne: new Map(),
            held: {
                rightHand: [],
                leftHand: []
            },
            onTable: new Set(ballsOnTable)
        };
    }

    //TODO : After parsing siteswaps, check that we don't have a conflict in the sens that we have created two events on the same beat if things were not properly defined.
    //TODO : TempoChange Offset !!!
    //TODO : Remove from class ?
    // Document that prefills cache information and checks that events happen on rhythm.
    pretreatEvents(events: FracSortedList<SchedulerEvent>): FracSortedList<SchedulerEvent2> {
        //TODO : Move Warnings about first hand and first error throw here.
        if (events.length === 0 || events[0][1].tempoChange === undefined) {
            throw Error(`Missing starting tempo indication for juggler ${this.name}`);
        }
        let startHand = events[0][1].newDefaultHand;
        if (startHand === undefined) {
            console.warn(
                `Juggler ${this.name}:\n\tNo starting hand detected. Assumes they will start with their right hand.`
            );
            startHand = "R";
        }
        let lastBeat = events[0][0];
        let lastTempo = events[0][1].tempoChange;
        let lastNewDefaultHand = startHand;
        const newEvents: FracSortedList<SchedulerEvent2> = [];
        for (const [beat, ev] of events) {
            // 1. Check if event is on rhythm nice and dandy. TODO HANDLE
            if (!isInRhythm(beat, lastBeat, lastTempo)) {
                throw Error(`TODO. Event not in rhythm.`);
            }
            // 2. Proceed with caching the tempo and hand used at event.
            if (ev.tempoChange !== undefined) {
                lastTempo = ev.tempoChange;
            }
            if (ev.newDefaultHand !== undefined) {
                lastNewDefaultHand = ev.newDefaultHand;
            }
            const newEvent = {
                ...ev,
                cache: { tempo: lastTempo, isNewHandRight: lastNewDefaultHand === "R" }
            };
            newEvents.push([beat, newEvent]);
            lastBeat = beat;
        }
        return newEvents;
    }

    //TODO : Methods instead of accessors ?
    // private get _currentBeat(): Fraction {
    //     return this.beats[this._currentBeatIdx][0];
    // }

    private get _nextEvent(): [Fraction, SchedulerEvent2] | [null, null] {
        return this._nextEventIdx < this.events.length
            ? this.events[this._nextEventIdx]
            : [null, null];
    }

    private get _lastEvent(): [Fraction, SchedulerEvent2] | [null, null] {
        return 0 < this._nextEventIdx ? this.events[this._nextEventIdx - 1] : [null, null];
    }

    getNextEventBeat(): Fraction | null {
        return this._nextEventIdx >= this.events.length ? null : this.events[this._nextEventIdx][0];
    }

    getNextCatchBeat(): Fraction | null {
        let minCatchBeat: Fraction | null = null;
        for (const [, { catchBeat }] of this._currentState.airborne) {
            if (minCatchBeat === null || minCatchBeat.gt(catchBeat)) {
                minCatchBeat = catchBeat;
            }
        }
        return minCatchBeat;
    }

    nextBeatToProcess(): Fraction | null {
        const nextCatchBeat = this.getNextCatchBeat();
        const nextEventBeat = this.getNextEventBeat();
        if (nextCatchBeat === null && nextEventBeat === null) {
            return null;
        }
        if (nextCatchBeat === null) {
            return nextEventBeat!;
        }
        if (nextEventBeat === null) {
            return nextCatchBeat!;
        }
        return nextCatchBeat.lt(nextEventBeat) ? nextCatchBeat : nextEventBeat;
    }

    requiresProcessing(): boolean {
        // The end has been reached if we no longer have events to process, nor
        // do we have balls in the air that need falling.
        return this.nextBeatToProcess() !== null;
    }

    //TODO Change to use ErrorLogger.
    logError(message: string, severity: "Log" | "Warning" | "Error" = "Warning"): void {
        const formattedMessage = `Juggler ${this.name}, Beat ${this._currentBeat} :
            ${message}`;
        if (severity === "Log") {
            console.log(formattedMessage);
        } else if (severity === "Warning") {
            console.warn(formattedMessage);
        } else {
            console.error(formattedMessage);
        }
    }

    //TODO : consistant evBeat / eventBeat ?
    //TODO : Document that works with prevEventIdx after targetBeat in special case ?
    //TODO : Possibly needs to recompute the prevEventIdx.
    //TODO : Really need to know about the next event ? Or just the previous rather ?
    //TODO : Remake functions to possibly take prevEventIdx argument.
    correctOffbeatBeat(
        targetBeat: Fraction,
        prevEventIdx?: number
    ): { beat: Fraction; prevEventIdx: number } {
        if (prevEventIdx === undefined) {
            prevEventIdx = this.getPreviousEventIdx(targetBeat);
        }
        const { eventBeat, tempo } = this.getEventInfo(prevEventIdx);
        const nbSteps = targetBeat.sub(eventBeat).div(tempo).ceil();
        const newBeat = eventBeat.add(tempo.mul(nbSteps));
        let newPrevEventIdx = prevEventIdx;
        if (
            prevEventIdx + 1 < this.events.length &&
            this.events[prevEventIdx + 1][0].lte(newBeat)
        ) {
            newPrevEventIdx++;
        }
        return { beat: newBeat, prevEventIdx: newPrevEventIdx };
    }

    getEventInfo(eventIdx: number): {
        eventBeat: Fraction;
        tempo: Fraction;
        isNewHandRight: boolean;
    } {
        const [evBeat, { cache }] = this.events[eventIdx];
        return { eventBeat: evBeat, ...cache };
    }

    //TODO : Check if beat is on time.
    //TODO : Misleading "previous" as it can return future beat if targetBeat is too small.
    getPreviousEventInfo(beat: Fraction): {
        eventBeat: Fraction;
        tempo: Fraction;
        isNewHandRight: boolean;
    } {
        // To get the beat info, we get the cached event that preceeds it.
        return this.getEventInfo(this.getPreviousEventIdx(beat));
    }

    getPreviousEventIdx(beat: Fraction): number {
        if (beat.lt(this.events[0][0])) {
            return 0;
        } else if (beat.gte(this.events[this.events.length - 1][0])) {
            return this.events.length - 1;
        }
        // Thanks to previous checks, the findIndex method won't return -1.
        // TODO : Faster bin search version ?
        return this.events.findIndex(([evBeat]) => evBeat.gt(beat));
    }

    //TODO : Check beat is on rhythm ? When should that be done ?
    //TODO : Check all functions when beat received before first event. Here, this function is called when tossing ball, so No Problemo :D
    //TODO : MAKE SURE TEMPO CHANGES HAPPEN ON BEATS ?! WITH OFFSET ? HOW TO HANDLE ?
    //TODO : Document functions with prevEvent, startBeat etc. Limit side effects. If side effects, document them.
    getCatchBeatFromHeight(height: number, startBeat: Fraction, prevEventIdx?: number): Fraction {
        if (prevEventIdx === undefined) {
            prevEventIdx = this.getPreviousEventIdx(startBeat);
        }
        let beat = startBeat;
        let eventIdx = prevEventIdx;
        for (let i = 0; i < height; i++) {
            if (eventIdx + 1 < this.events.length) {
                if (beat.equals(this.events[eventIdx + 1][0])) {
                    eventIdx++;
                } else if (beat.gt(this.events[eventIdx + 1][0])) {
                    throw new Error("Shouldn't happen (sanity check).");
                }
            }
            const tempo = this.events[eventIdx][1].cache.tempo;
            beat = beat.add(tempo);
        }
        return beat;
    }

    //TODO2
    //TODO : This method and above, check for sanity that we look into future.
    //TODO Factorize loop's content which are the same in both cases ?
    //Would allow for error handling when somehting is wrong ?
    //TODO : When to check if beats on rhythm ?
    //TODO : Remove the fact that prevEventIdx is optional ?
    // getHeightFromBeats(startBeat: Fraction, endBeat: Fraction, prevEventIdx?: number): number {
    //     if (prevEventIdx === undefined) {
    //         prevEventIdx = this.getPreviousEventIdx(startBeat);
    //     }
    //     let nbSteps = 0;
    //     const itEvents = this._itEvents.copy();
    //     let currentTempo = this._currentTempo.clone();
    //     let currentBeat = this._currentBeat.clone();
    //     while (currentBeat.lt(beat)) {
    //         if (itEvents.isAccessible() && itEvents.pointer[0] === currentBeat) {
    //             if (itEvents.pointer[1].tempoChange !== undefined) {
    //                 currentTempo = itEvents.pointer[1].tempoChange;
    //             }
    //             itEvents.next();
    //         }
    //         currentBeat = currentBeat.add(currentTempo);
    //         nbSteps++;
    //     }
    //     // We need to check if the ball will fall on a beat.
    //     return {
    //         failed: !currentBeat.equals(beat),
    //         nbSteps: nbSteps,
    //         endBeat: currentBeat
    //     };
    // }

    //TODO : Make all this failing functions return failure in Object instead of raw ?
    // Assumption : we only use this function from the overall state manager
    // that will handle in-between juggler throws. Thus we can advance in beats
    // and the only balls we will receive will be at the latest beat which
    // happens to be currentState.

    //TODO : In all methods, make sure we know that EVENTS OCCUR ON TEMPO !!!
    //TODO : We don't really descend the balls but we check if they are caught.
    //TODO : Instead of modifying current state... why not return a new one ?
    //TODO : Warn of multiple balls falling at the same time when they are relaunched only.
    //since that is when there is an ambiguity on which one to throw first.
    //If ball was specified, fail gracefully ?
    //TODO : Should the currentBeat have been updated yet or not (currently it is).
    //TODO : Balls not ending on beat have been handled already before adding them to airborne.
    //TODO : Handle event change.
    //TODO : Change param name ?
    //TODO : private or protected functions with side effects that are order dependent.
    //TODO : pass jugglerstate as argument to avoid side effect / dependency on private fields. (have more information to deduce prevEventIdx ?).
    //TODO : Before calling, compute right prevEventIdx
    //TODO : Be carfeul : Catch hand is determined at throw time if thrown to self only ?
    //TODO : Handle hand target that is x !!!
    descendAirborneBalls(
        toBeat: Fraction,
        prevEventIdx: number,
        state: JugglerState
    ): JugglerState {
        // Identify caught balls.
        const caughtBalls: [Ball[], Ball[]] = [[], []];
        const defaultCatchWithRightHand = this.defaultCatchWithRightHand(toBeat, prevEventIdx);
        for (const { catchBeat, toRightHand, ball } of state.airborne.values()) {
            if (catchBeat.equals(toBeat)) {
                // If a ball has a given catching hand, it has precedence over the
                // default one computed earlier.
                const catchWithRightHand = toRightHand ?? defaultCatchWithRightHand;
                if (catchWithRightHand) {
                    caughtBalls[1].push(ball);
                } else {
                    caughtBalls[0].push(ball);
                }
            } else if (catchBeat.gt(toBeat)) {
                throw Error("Shouldn't happen (sanity check).");
            }
        }

        // Put the caught balls in hand.
        for (const ball of caughtBalls[0]) {
            state.airborne.delete(ball.id);
            state.held.leftHand.push(ball);
        }
        for (const ball of caughtBalls[1]) {
            state.airborne.delete(ball.id);
            state.held.rightHand.push(ball);
        }

        // If two balls are caught at the same time in the same hand,
        // We don't know necessarily know how to arrange them in the hand.
        if (caughtBalls[0].length > 1) {
            this.logError(
                `Juggler ${this.name} caught ${"TODO"} balls on the same beat with their left hand.\nProceeding, but there may be an ambiguity and randomness on future throws.`,
                "Warning"
            );
        }
        if (caughtBalls[1].length > 1) {
            this.logError(
                `Juggler ${this.name} caught ${"TODO"} balls on the same beat with their right hand.\nProceeding, but there may be an ambiguity and randomness on future throws.`,
                "Warning"
            );
        }

        return state;
    }

    defaultCatchWithRightHand(beat: Fraction, prevEventIdx: number): boolean {
        const { eventBeat, tempo, isNewHandRight } = this.getEventInfo(prevEventIdx);
        const nbSteps = beat.sub(eventBeat).div(tempo);
        if (!nbSteps.divisible(1)) {
            throw Error("Souldn't happen (sanity check).");
        }
        return XOR(nbSteps.divisible(2), isNewHandRight);
    }

    //TODO2
    //TODO : When to copy states ? In loop yes, except the last one, which is before the
    //next time the loop is executed.
    //TODO: WHen to update current Beat
    //TODO: How to handle the beginning ?
    //TODO: How to handle tempo change and ball swap ?
    //TODO: Do we need _itBeats ?
    //TODO: Think to change hand parity.
    //TODO: How to handle when hand is specified for throws ?
    //TODO : Verify that throws using height are made with same tempo + offset ???
    //TODO : In all methods, think of advancing the itEvents !
    //TODO : Js-sdsl Deques have a lot of empty elements so memory concern ?
    //TODO : Error messages formatted with measures ?

    // TODO : Function returns nothing if not the right beat yet ???
    // TODO : Rename method to better convey that idea. (fillInTosses)
    // TODO : Tosses instead of throws in entire codebase.
    // Needs to be called after the balls have descended as we may want to throw ball that just was caught.
    // TODO : Decouple method to get throwing/catching hand ?
    // TODO : Method to format errors
    // TODO : Misleading name : filledin but not completely. (sender + juggler's dest name, NOT juggler's dest beat.) Change it.
    //TODO : Unify this toss format (to / from) with earlier ones to reuse printing function.
    //TODO : Error handling.
    //TODO: No Ball removal in this function...
    tossBalls(
        tosses: PartialToss[],
        state: JugglerState,
        beat: Fraction,
        prevEventIdx: number
    ): { tosses: PartialToss2[]; state: JugglerState } {
        const defaultCatchWithRightHand = this.defaultCatchWithRightHand(beat, prevEventIdx);
        const newTosses: PartialToss2[] = [];
        for (const toss of tosses) {
            // Compute the throwing hand.
            let fromRightHand: boolean;
            if (toss.from.hand !== undefined) {
                fromRightHand = toss.from.hand === "R";
            } else {
                fromRightHand = defaultCatchWithRightHand;
            }
            const tossHand = fromRightHand ? state.held.rightHand : state.held.leftHand;

            // Compute the ball thrown.
            let ball: Ball;
            if (toss.ball === undefined) {
                if (tossHand.length === 0) {
                    throw Error("TODO and break");
                }
                ball = tossHand.pop()!;
            } else if (toss.ball.id !== undefined) {
                const ballIdx = tossHand.findIndex((ball) => ball.id === toss.ball!.id);
                if (ballIdx === -1) {
                    throw Error("TODO and break");
                }
                // Remove the ball from tossHand and store it.
                ball = tossHand.splice(ballIdx, 1)[0];
            } else {
                // We look for the ball with the right name
                const matches: Ball[] = [];
                for (const ball of tossHand) {
                    if (ball.name === toss.ball.name) {
                        matches.push(ball);
                    }
                }
                if (matches.length === 0) {
                    throw Error("TODO and break");
                } else if (matches.length > 1) {
                    throw Error("TODO but take ball closest to be thrown");
                }
                ball = matches[matches.length - 1];
            }

            // Compute the catching beat
            let toBeat: Fraction;
            if (toss.to.mode === "Height") {
                toBeat = this.getCatchBeatFromHeight(toss.to.height, beat, prevEventIdx);
            } else {
                toBeat = toss.to.beat;
            }

            // Complete the toss info.
            newTosses.push({
                from: {
                    beat: toss.from.beat,
                    juggler: toss.from.juggler,
                    rightHand: fromRightHand
                },
                to: { beat: toBeat, juggler: toss.to.juggler, hand: toss.to.hand },
                ball: ball
            });
        }

        // this.logError(
        //     `Can't infer the ball tossed : no ball in the \
        //     ${fromRightHand ? "right" : "left"} hand.`,
        //     "Error"
        // );
        // this.logError(
        //     `Can't toss ball ${toss.ball.name} from the \
        //     ${toss.from.rightHand ? "right" : "left"} hand as it not present.
        //     Right hand contains : [${rightHandContent}].
        //     Left hand contains : [${rightHandContent}].`,
        //     "Error"
        // );
        // We log that the required ball to throw was missing.
        //             let rightHandContent = "";
        //             let leftHandContent = "";
        //             for (const ball of heldClone.rightHand) {
        //                 rightHandContent += ball + ", ";
        //             }
        //             for (const ball of heldClone.leftHand) {
        //                 leftHandContent += ball + ", ";
        //             }
        //             if (rightHandContent.endsWith(", ")) {
        //                 rightHandContent = rightHandContent.slice(0, -2);
        //             }
        //             if (leftHandContent.endsWith(", ")) {
        //                 leftHandContent = leftHandContent.slice(0, -2);
        //             }
        //             this.logError(
        //                 `Can't toss ball ${toss.ball.name} from the \
        //                 ${toss.from.rightHand ? "right" : "left"} hand as it not present.
        //                 Right hand contains : [${rightHandContent}].
        //                 Left hand contains : [${rightHandContent}].`,
        //                 "Error"
        //             );
        return { tosses: newTosses, state: state };
    }

    //TODO2
    //TODO URGENT : WHEN DOES CURRENT BEAT INCREASE ? IS NAME MISLEADING ? OR NAME OF GETNEXTBEATMETHOD ?
    //TODO : In global class handling jugglers, have concerned jugglers for next beat and the ones that have an event.
    //Will mean removing checks in methods ?
    //TODO : Precise in methods doc that the only method having side effect on iterators is advanceState.

    needsEventHandling(): boolean {
        const nextEventsBeat = this.getNextEventBeat();
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        return nextEventsBeat !== null && nextEventsBeat.equals(this._currentBeat);
    }

    //TODO : document that state is not copied ?
    //TODO : Lefthand / Righthand : make Array. It is simpler to manipulate.
    //and document the convention that left cell = left, right cell = right.
    //Function to unify the id/name search here and in fillTossesInformation ?
    swapBalls(state: JugglerState, newHands: PartialBallsInHands): JugglerState {
        // 1. Put all held balls on the table.
        for (const ball of state.held.rightHand) {
            state.onTable.set(ball.id, ball);
        }
        for (const ball of state.held.leftHand) {
            state.onTable.set(ball.id, ball);
        }

        // 2. Put the according balls from the table in the hands.
        for (const handName of ["leftHand", "rightHand"]) {
            for (const ballPartial of newHands[handName] as PartialBall[]) {
                let ball: Ball;
                if (ballPartial.id !== undefined) {
                    if (!state.onTable.has(ballPartial.id)) {
                        throw Error("TODO and break");
                    }
                    ball = state.onTable.get(ballPartial.id)!;
                } else {
                    const matches: Ball[] = [];
                    for (const ball of state.onTable.values()) {
                        if (ball.name === ballPartial.name) {
                            matches.push(ball);
                        }
                    }
                    if (matches.length === 0) {
                        throw Error("TODO and break");
                    } else if (matches.length > 1) {
                        throw Error("TODO but take ball closest to be thrown");
                    }
                    ball = matches[0];
                }
                state.onTable.delete(ball.id);
                state.held[handName].push(ball);
            }
        }
        return state;
    }

    //TODO : Rename method.
    //TODO : Make it so it is the scheduler that stores the last state and event idx ?
    //TODO : Make it so if smaller beat is given it restarts from earlier and discard laters steps
    processUntil(beat: Fraction): { failed: boolean; tosses: PartialToss2[] } {
        // Increase this._nextEventIdx if needed.
        let hasEvent: boolean;
        if (this.getNextEventBeat()?.equals(beat)) {
            this._nextEventIdx++;
            hasEvent = true;
            if (!this._hasProcessedFirstBeat) {
                this._hasProcessedFirstBeat = true;
            }
        } else if (this.getNextEventBeat()?.lt(beat)) {
            throw Error("Shouldn't happen (sanity check).")
        } else {
            hasEvent = false;
        }

        // Manage state.
        let state = this._currentState;
        state = this.descendAirborneBalls(beat, this., state);
        if (hasEvent) {
            const newBalls = this.getPreviousEventIdx
            state = this.swapBalls(state, this.events);
        }
        failedAcc ||= this.changeDefaultHand();
        const { failed, tosses } = this.fillTossInformation();
        failedAcc ||= failed;
        failedAcc ||= this.removeBallsFromHands(tosses); //TODO : Remove this method ? Or remove its parameter by adding way to easily compute
        // hand's sign ?
        return { failed: failedAcc, tosses: tosses };
    }

    //TODO : Change these variable names. (userighthand => righthand ?)
    //TODO : Change name to better illustrate that the balls will appear in the state's airborne ?
    receiveTosses(tosses: PartialToss2[]): { failed: boolean; tosses: SimulatorToss[] } {
        // Edge case : a ball was tossed to a player and should appear in its airborne state
        // *before* the first beat (which coincides with the beat of the first event).
        // In that case; the current beat is brought backwards, with no special event added.
        if (!this._hasProcessedFirstBeat) {
            // A first beat always defines tempo, thus we can check if it is being processed as such.
            if (this.needsEventHandling()) {
                this._hasProcessedFirstBeat = true;
            }
            for (const toss of tosses) {
                if (toss.from.beat.lt(this._currentBeat)) {
                    // Since we receive a ball earlier than anticipated, we'll process the first beat
                    // that is eventless.
                    this._hasProcessedFirstBeat = true;
                    const nbStepsBack = this._currentBeat
                        .sub(toss.from.beat)
                        .div(this._currentTempo)
                        .floor();
                    this._currentBeat = this._currentBeat.sub(this._currentTempo.mul(nbStepsBack));
                }
            }
        }

        let failedAcc = false;
        let completedTosses: SimulatorToss[] = [];
        for (const toss of tosses) {
            const { failed, nbSteps, endBeat } = this.getNbSteps(toss.to.beat);
            if (failed) {
                this.logError(
                    `Can't catch ball ${toss.ball.name} because it is caught off-beat.
                    Juggler's previous beat : ${"TODO"}.
                    Ball catch beat : ${endBeat}.
                    Juggler's next beat : ${"TODO"}.`,
                    "Error"
                );
                failedAcc ||= failed;
            }
            const remainingHeight = nbSteps;
            const remainingBeats = toss.to.beat.sub(this._currentBeat);
            this._currentState.airborne.set(toss.ball.name, {
                remainingBeats: remainingBeats,
                remaining: remainingHeight,
                toRightHand: toss.to.rightHand //TODO : Force computation of hand !
            });
            completedTosses.push({});
        }
        return failedAcc;
    }

    //TODO2
    advanceState(): void {
        this.beats.push([this._currentBeat, structuredClone(this._currentState)]);
        if (this._itEvents.isAccessible() && this._currentBeat.equals(this._itEvents.pointer[0])) {
            this._itEvents.next();
        }
        this._currentBeat = this._currentBeat.add(this._currentTempo);
        this._currentState.useRightHand = !this._currentState.useRightHand;
    }

    //TODO2
    getStates(): FracSortedList<JugglerState> {
        const it = this.beats.begin();
        const knownStates = new FracTimeline<JugglerState>();
        while (it.isAccessible() && it.pointer[1].state !== undefined) {
            knownStates.setElement(it.pointer[0], it.pointer[1].state);
            it.next();
        }
        return knownStates;
    }

    //TODO.
    resetFrom(beat: Fraction): void {}

    //TODO : throw + try catch instead of returning boolean ?

    //TODO : Vérifier que tempo change tombe bien sur un beat de l'ancien tempo.
    //TODO : Messages d'erreurs avec position.

    // Créer les rythmes en vérifiant que les changements de rythme se font bien sur un multiple.
    // de la signature actuelle.
    // Générer jusqu'à endTime.

    // populateBeats(endBeat: Fraction, endNewAirborne: PartialToss2[] = []): boolean {
    //     // Since this function is only called when a throw from an outside
    //     // juggler may only happen on the last beat, we can safely ignore it.
    //     while (this._currentBeat.lt(endBeat)) {
    //         const failed = this.descendAirborneBalls();
    //         if (failed) {
    //             return true;
    //         }
    //         this._currentBeat = this._currentBeat.add(this._currentTempo);
    //         this._currentState.useRightHand = !this._currentState.useRightHand;
    //     }
    //     // Handle the last beat if this juggler has events to unfold.
    //     // We first descend the balls, then change hands content and tempo
    //     // and lastly we make the possible throws with those new parameters.
    //     // (ie the balls thrown dissapear from the hands, and the received balls
    //     // (from this juggler or others) are contained in endNewAirborneBalls).
    //     //TODO : Partially fuse with previous for loop ?
    //     if (this._currentBeat.equals(endBeat)) {
    //         const failed = this.descendAirborneBalls();
    //         if (failed) {
    //             return true;
    //         }
    //         const { tosses, tempoChange, ballsSwap } = this._itEvents.pointer[1];
    //         this._itEvents.next();
    //         if (tempoChange !== undefined) {
    //             this._currentTempo = tempoChange;
    //         }
    //         if (ballsSwap !== undefined) {
    //             for (const ball of this._currentState.held.rightHand) {
    //                 this._currentState.onTable.add(ball);
    //             }
    //             for (const ball of this._currentState.held.leftHand) {
    //                 this._currentState.onTable.add(ball);
    //             }
    //             this._currentState.held = structuredClone(ballsSwap);
    //         }
    //         for (const toss of tosses) {
    //             // We ake the balls dissapear from hands.
    //             const fromRightHand = toss.from.rightHand ?? this._currentState.useRightHand;
    //             const hand = fromRightHand
    //                 ? this._currentState.held.rightHand
    //                 : this._currentState.held.leftHand;
    //             if (toss.ball === undefined) {
    //                 hand.popFront();
    //             } else if (hand.find(toss.ball.name) === hand.end()) {
    //                 console.error(`Juggler ${this.name} wants to throw ball \
    //                     ${toss.ball.name} from the ${fromRightHand ? "right" : "left"} \
    //                     hand on beat ${"TODO"} which isn't present.
    //                     Right hand contains : ${"TODO"}
    //                     Left hand contains : ${"TODO"}`);
    //                 return true;
    //             } else {
    //                 hand.eraseElementByValue(toss.ball.name);
    //             }
    //             // Here we need to infer the correct information.
    //             // let toJuggler: string;
    //             // let toHand:
    //             // if (toss.to.juggler === undefined) {
    //             //     toss.to
    //             // }
    //         }
    //         this._currentBeat = this._currentBeat.add(this._currentTempo); //TODO WHERE ?
    //         this._currentState.useRightHand = !this._currentState.useRightHand; //TODO WHERE ?
    //     }
    //     // Handling outside catches.
    //     //TODO : Change these variable names. (userighthand => righthand ?)
    //     //TODO : Compute the other "remaining"Beats/Height.
    //     for (const toss of endNewAirborne) {
    //         let remainingBeats: Fraction;
    //         let remainingHeight: number;
    //         if (toss.to.mode === "Beat") {
    //             const results = this.getNbSteps(toss.to.beat);
    //             if (results.failed) {
    //                 console.error(`Juggler ${this.name} can't catch ball \
    //                 ${toss.ball.name} tossed by juggler ${toss.from.juggler} \
    //                 on beat ${toss.from.beat} because it falls off-beat (on beat \
    //                 ${results.endBeat}) while ${this.name}'s previous beat is \
    //                 ${"TODO"} and next beat is ${"TODO"}.`);
    //             }
    //             remainingHeight = results.nbSteps;
    //             remainingBeats = toss.to.beat.sub(this._currentBeat);
    //         } else {
    //             remainingHeight = toss.to.height;
    //             remainingBeats = this.getFutureBeat(toss.to.height);
    //         }
    //         this._currentState.airborne.set(toss.ball.name, {
    //             remainingBeats: remainingBeats,
    //             remainingHeight: remainingHeight,
    //             userightHand: toss.to.rightHand
    //         });
    //     }
    // }
}

//TODO : V4 Allow Siteswap
//TODO : Changing tempo
//TODO : Offset tempo
//TODO : Add catch statements (1s step : all catch to throw)
//TODO : Infer with music alerts
// export function inferMissingPatternInfo(pattern: MusJugPatternIncomplete): MusJugPatternComplete {
//     let stateTime = undefined;
//     let
//     const it = pattern.begin();
//     if (!it.isAccessible()) {
//         console.log("Pattern is empty");
//     }
//     if (
//     return;
// }

// const danube: [[number, Fraction, Events][], [number, Fraction, Events][]] =
// [[-1, new Fraction("2"), ], []]

//TODO ?
// interface MusicSignatureChange {
//     signature: Fraction;
//     from: { measure: number; beat: Fraction };
// }

//TODO : Swing rhythm ? Could it be interesting ?
// interface MusicTempoChange {
//     baseNote: Fraction; //1 = whole note, 1/2 = white, 1/4 = black
//     tempo: number;
//     from: { measure: number; beat: Fraction };
// }

//Custom utility type:
// export type DeepRequired<T> = {
//     [K in keyof T]: Required<DeepRequired<T[K]>>;
// };
// export type DeepPartial<T> = {
//     [K in keyof T]: Partial<DeepPartial<T[K]>>;
// };

/** @constant
The epsilon value to use for comparisons ont the timeline.
Two events apart by less than 0.0001 s are considered to be the same.
*/
const EPSILON = 1e-5;

//TODO : Precise in seconds or in milliseconds ?
function is_equal(t1: number, t2: number): boolean {
    return Math.abs(t1 - t2) < EPSILON;
}

type MusicTime = [number, Fraction];

class MusicTimeline<EventType> extends Timeline<MusicTime, EventType> {
    static cmp = (x: MusicTime, y: MusicTime) => {
        if (x[0] === y[0]) {
            return x[1].compare(y[1]);
        }
        return x[0] - y[0];
    };
    constructor(container?: [MusicTime, EventType][]) {
        super(container, MusicTimeline.cmp);
    }
}
interface Measure {
    tempoUnit: Fraction;
    signature: Fraction;
    startingBeat: Fraction;
}

//Fuse measure and beat to be MusicTime ?
interface Notes {
    pitches: string[];
    measure: number;
    beat: Fraction;
    // real_time: number;
}

//TODO Add offset to tempo changes to allow two jugglers juggling on the same tempo but with a phase.
// class MusicStructure {
//     measures: Measure[] = [];
//     // notes: Notes[] = [];

//     // TODO : Better names ?
//     // TODO : Rename in musicTime measure to measureNb ?
//     beatToMeasureAndBeat(beat: Fraction): MusicTime {
//         let acc = new Fraction(0);
//         for (let i = 0; i < this.measures.length; i++) {
//             const measure = this.measures[i];
//             acc = acc.add(measure.signature);
//             if (beat.lt(acc)) {
//                 return [i, beat.sub(acc.sub(measure.signature))];
//             }
//         }
//         // If not in known measures
//         throw Error("Beat is outside of known measures.");
//     }

//     measureAndBeatBeat([measureNb, beat]: MusicTime): Fraction {
//         if (measureNb >= this.measures.length) {
//             throw Error("Beat and Measure are outside of known measures.");
//         }
//         let acc = beat.clone();
//         for (let i = 0; i < measureNb; i++) {
//             acc = acc.add(this.measures[i].signature);
//         }
//         return acc;
//     }
// }

// class MusicTime {
//     readonly musicStructure: MusicStructure;
//     readonly measure: number;
//     readonly beat: Fraction;

//     constructor(measure: number, beat: Fraction, music: MusicStructure) {
//         this.measure = measure;
//         this.beat = beat;
//         this.musicStructure = music;
//     }
// }

//TODO rename throw to toss everywhere
function getMusic(
    pattern: FracTimeline<SimulatorToss[]>,
    measures: Measure[]
): MusicTimeline<Note[]> {
    const music = new MusicTimeline<Notes[]>();
    for (const [, tosses] of pattern) {
        for (const toss of tosses) {
            const measure = measures[toss.to.measure];
            // const time = toss.to.beat.mul(measure.signature.d).add(measure.startingBeat);
            const time: [number, Fraction] = [toss.to.measure, toss.to.beat];
            let notes: Note[] | undefined = music.getElementByKey(time);
            if (notes === undefined) {
                notes = [];
                music.setElement(time, notes);
            }
            notes.push({
                pitch: toss.ball.sound,
                // measure: toss.to.measure,
                beat: toss.to.beat
                // real_time: toss.to.real_time
            });
        }
    }
    return music;
}

/**
 * Class that describes an array where values are inserted <= by the user
 */
// class SortedArray<T> {
//     ar: T[];
//     cmp: (a: T, b: T) => boolean;
//     constructor(initialArray?: T[], cmp: (a: T, b: T) => boolean) {
//         this.ar = initialArray?.sort() ?? [];
//         this.cmp = cmp;
//     }

//     add
// }
