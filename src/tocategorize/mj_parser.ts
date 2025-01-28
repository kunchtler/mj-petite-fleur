import { Deque, OrderedMap, OrderedMapIterator, OrderedSet } from "js-sdsl";
import Fraction from "fraction.js";
import { Juggler } from "../simulator/Juggler";
import { Timeline } from "../simulator/Timeline";

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

class FracTimeline<EventType> extends Timeline<Fraction, EventType> {
    static cmp = (x: Fraction, y: Fraction) => (x === y ? 0 : x.gt(y) ? 1 : -1);
    constructor(container?: [Fraction, EventType][]) {
        super(container, FracTimeline.cmp);
    }
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

interface SwapBalls {
    rightHand: Deque<string>;
    leftHand: Deque<string>;
}

//TODO : Rename or add namesapces.
//TODO : Errors or console.log ?
//TODO : Differentiate name and unique id for balls ?
interface PartialToss {
    from?: { juggler?: string; rightHand?: boolean; beat?: Fraction };
    to?: { juggler?: string; rightHand?: boolean; beat?: Fraction };
    // ssHeight?: number; //Doesn't make sense when J1 throws to J2 that has offset rhythm.
    ball?: { name?: string /*; id?: number*/ };
}

// type Events = (PartialThrow | SiteswapTempoChange | SwapBalls)[];
// TODO : Rename
interface PartialEvents {
    tosses: PartialToss[];
    tempoChange?: Fraction;
    ballsSwap?: SwapBalls;
}

interface Events {
    tosses: Toss[];
    tempoChange?: Fraction;
    ballsSwap?: SwapBalls;
}

// type JugglerState = Map<
//     string,
//     { throwTime: Fraction; catchTime: Fraction; remainingTime: Fraction } | "onTable"
// >;

interface Measure {
    tempoUnit: Fraction;
    signature: Fraction;
    startingBeat: Fraction;
}

//TODO : Remove real_time ?
interface Toss {
    from: {
        // juggler: number;
        juggler: string;
        rightHand: boolean;
        // measure: number;
        beat: Fraction;
        // real_time: number;
    };
    // to: { juggler: number; rightHand: boolean; measure: number; beat: Fraction; real_time: number };
    to: {
        juggler: string;
        rightHand: boolean;
        // measure: number;
        beat: Fraction;
        // real_time: number;
    };
    // ssHeight: number;
    ball: { name: string /*id: number;*/ /*sound: string*/ };
}

//Fuse measure and beat to be MusicTime ?
interface Notes {
    pitches: string[];
    measure: number;
    beat: Fraction;
    // real_time: number;
}

class MultiTimeLineReader<EventType> {
    timelines: FracTimeline<EventType>[];
    private _time: Fraction;
    private _iterators: OrderedMapIterator<Fraction, EventType>[];

    //TODO : Handle case where all empty.
    constructor(timelines: FracTimeline<EventType>[]) {
        this.timelines = timelines;
        for (const timeline of timelines) {
            if (timeline.length !== 0) {
            }
        }
    }
}

class MusicStructure {
    measures: Measure[] = [];
    // notes: Notes[] = [];

    // TODO : Better names ?
    // TODO : Rename in musicTime measure to measureNb ?
    beatToMeasureAndBeat(beat: Fraction): MusicTime {
        let acc = new Fraction(0);
        for (let i = 0; i < this.measures.length; i++) {
            const measure = this.measures[i];
            acc = acc.add(measure.signature);
            if (beat.lt(acc)) {
                return [i, beat.sub(acc.sub(measure.signature))];
            }
        }
        // If not in known measures
        throw Error("Beat is outside of known measures.");
    }

    measureAndBeatToBeat([measureNb, beat]: MusicTime): Fraction {
        if (measureNb >= this.measures.length) {
            throw Error("Beat and Measure are outside of known measures.");
        }
        let acc = beat.clone();
        for (let i = 0; i < measureNb; i++) {
            acc = acc.add(this.measures[i].signature);
        }
        return acc;
    }
}

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
function getMusic(pattern: FracTimeline<Toss[]>, measures: Measure[]): MusicTimeline<Note[]> {
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

// function validateMusic(computedMusic: MusicTimeline<Note[]>, expectedMusic: any): boolean {}

// function splitTimeline(events: MusicTimeline<Events>, jugglerNames: string[]): {musicEvents: MusicTimel}

//Ball Name -> Time until caught

class IWorkOnPatterns {
    jugglers: Map<string, JugglerManager>;
    // jugglers: { name: string; balls: { name: string }[]; manager: JugglerManager }[];

    constructor(jugglers: { name: string; balls: { name: string }[] }[]) {
        this.jugglers = new Map();
        for (const juggler of jugglers) {
            this.jugglers.set(juggler.name, new JugglerManager(juggler.name));
        }
    }

    validatePattern() {
        for (const [name, juggler] of this.jugglers) {
            juggler.populateBeats();
        }
    }
}

interface JugglerState {
    airborne: Map<
        string,
        | { mode: "CatchOnBeat"; remainingBeats: Fraction }
        | { mode: "ThrowInHeight"; remainingUnitValues: number }
    >;
    held: { rightHand: Deque<string>; leftHand: Deque<string> };
    onTable: Set<string>;
    useRightHand: boolean;
}

//TODO : For juggling, names Signature / Tempo ?
//TODO : Check that works if events is empty.
//TODO : Rename "Events" => "Event"
//TODO : Rename 'Tempo' => "unit value"
//TODO : Rename 'beats' => "states" ?
class JugglerManager {
    name: string;
    events: FracTimeline<PartialEvents>;
    beats: FracTimeline<JugglerState>;
    // states = new MusicTimeline<JugglerState>();
    // _throw_event = new MusicTimeline<Events>();
    private _currentTempo: Fraction;
    private _currentState: JugglerState;
    private _currentBeat: Fraction;
    private _itEvents: OrderedMapIterator<Fraction, PartialEvents>;
    private _itBeats: OrderedMapIterator<Fraction, JugglerState>;

    //TODO : Make sure that start time is the time BEFORE any juggler throws a single ball.
    //TODO : What if ball is caught before first beat because someone else threw it ?
    //TODO : Create new complete tosses and catches that have been computed.
    //TODO : When only siteswap height 3 was given, should we deafult to:
    // - 3 beats (even if the tempo then gets shorter ?)
    // - 3 * current unit value (possibly falling outside of rhythm)
    // FIRST ANSWER, reason : to keep the symbolic of the height (hand changing etc)
    //+ Easier to understand in practice (number of actions done before catching it).
    constructor(name: string, events: FracTimeline<PartialEvents>, balls: string[]) {
        this.name = name;
        this.events = events;
        this.beats = new FracTimeline();

        // Check if the events properly begin with a unit value.
        const it = this.events.begin();
        if (!it.isAccessible()) {
            return; // Event map is empty.
        } else if (it.pointer[1].tempoChange === undefined) {
            throw Error(`Missing starting tempo indication for juggler ${this.name}`);
        }
        this._currentTempo = it.pointer[1].tempoChange;
        // this._currentBeat = it.pointer[0].;
        this._currentState = {
            airborne: new Map(),
            held: { rightHand: new Deque(), leftHand: new Deque() },
            onTable: new Set(balls)
        };
        this._itEvents = this.events.begin();
        this._itBeats = this.beats.begin();
    }

    nextEventBeat(): Fraction | null {
        return this._itEvents.isAccessible() ? this._itEvents.pointer[0] : null;
    }

    advanceEvent(): void {
        this._itEvents.next();
    }

    reachedEnd(): boolean {
        // The end has been reached if we no longer have events to process, nor
        // do we have balls in the air that need falling.
        return this.nextEventBeat() === null && this._currentState.airborne.size === 0;
    }

    // TODO : Class and method names.
    // TODO : Console.warn / Console.error.
    // TODO : Can Fail ?
    // Assumption : we only use this function from the overall state manager
    // that will handle in-between juggler throws. Thus we can advance in beats
    // and the only balls we will receive will be at the latest beat which
    // happens to be currentState.
    advanceBeatFirstHalf(): PartialToss[] {
        return [];
    }

    //TODO : We don't really descend the balls but we check if they are caught.
    //TODO : Instead of modifying current state... why not return a new one ?
    //TODO : Warn of multiple balls falling at the same time when they are relaunched only.
    //since that is when there is an ambiguity on which one to throw first.
    //If ball was specified, fail gracefully ?
    //TODO : Should the currentBeat have been updated yet or not (currently it is).
    descendAirborneBalls(): boolean {
        // Checks which balls have been caught depending on their mode.
        const caughtBalls: string[] = [];
        for (const [ball, status] of this._currentState.airborne) {
            if (status.mode === "CatchOnBeat") {
                // We should check if the beat the ball falls at has been met.
                status.remainingBeats = status.remainingBeats.sub(this._currentTempo);
                if (status.remainingBeats.lt(0)) {
                    console.error(`Juggler ${this.name} caught ball ${ball} \
                        off-beat at beat ${"TODO"} in between beat ${"TODO"} \
                        and ${"TODO"}`);
                    return true;
                } else if (status.remainingBeats.equals(0)) {
                    caughtBalls.push(ball);
                }
            } else {
                // We should check if the height the ball was thrown is now 0.
                status.remainingUnitValues -= 1;
                if (status.remainingUnitValues === 0) {
                    caughtBalls.push(ball);
                }
            }
        }
        let catchingHand: Deque<string>;
        if (this._currentState.useRightHand) {
            catchingHand = this._currentState.held.rightHand;
        } else {
            catchingHand = this._currentState.held.leftHand;
        }
        if (caughtBalls.length > 1) {
            console.warn(`Juggler ${this.name} caught balls ${"TODO"} at the \
                same time on beat ${"TODO"}. Proceeding, but there may be an \
                ambiguity and randomness on future throws.`);
        }
        for (const ball of caughtBalls) {
            this._currentState.airborne.delete(ball);
            catchingHand.pushFront(ball);
        }
        return false;
    }

    //TODO : When to copy states ? In loop yes, except the last one, which is before the
    //next time the loop is executed.
    //TODO: WHen to update current Beat
    //TODO: How to handle the beginning ?
    //TODO: How to handle tempo change and ball swap ?
    //TODO: Do we need _itBeats ?
    //TODO: Think to change hand parity.
    //TODO: How to handle when hand is specified for throws ?
    populateBeats(endBeat: Fraction, endNewAirborneBalls?: string[]): boolean {
        // Since this function is only called when a throw from an outside
        // juggler may only happen on the last beat, we can safely ignore it.
        while (this._currentBeat.lt(endBeat)) {
            const failed = this.descendAirborneBalls();
            if (failed) {
                return true;
            }
            this._currentBeat = this._currentBeat.add(this._currentTempo);
            this._currentState.useRightHand = !this._currentState.useRightHand;
        }
        // Handle the last beat if this juggler has events to unfold.
        // We first descend the balls, then change hands content and tempo
        // and lastly we make the possible throws with those new parameters.
        // (ie the balls thrown dissapear from the hands, and the received balls
        // (from this juggler or others) are contained in endNewAirborneBalls).
        if (this._currentBeat.equals(endBeat)) {
            const failed = this.descendAirborneBalls();
            if (failed) {
                return true;
            }
            this._currentBeat = this._currentBeat.add(this._currentTempo);
            const { tosses, tempoChange, ballsSwap } = this._itEvents.pointer[1];
            if (tempoChange !== undefined) {
                this._currentTempo = tempoChange;
            }
            if (ballsSwap !== undefined) {
                for (const ball of this._currentState.held.rightHand) {
                    this._currentState.onTable.add(ball);
                }
                for (const ball of this._currentState.held.leftHand) {
                    this._currentState.onTable.add(ball);
                }
                this._currentState.held = structuredClone(ballsSwap);
            }
            for (const toss of tosses) {
                //Here we need to infer the correct information.
            }
        }
    }

    /*advanceBeatSecondHalf*/ invokeOutsideBalls(newAirborneBalls: string[]): boolean {
        return false;
    }

    populateNextBeat(): void {
        return;
    }

    handleEvent(): void {
        return;
    }

    //TODO : Vérifier que tempo change tombe bien sur un beat de l'ancien tempo.
    //TODO : Messages d'erreurs avec position.

    // Créer les rythmes en vérifiant que les changements de rythme se font bien sur un multiple.
    // de la signature actuelle.
    // Générer jusqu'à endTime.
    ApopulateBeats(endTime: MusicTime): void {
        // Checks whether starting tempo is correctly configured or not.
        const it = this.events.begin();
        if (!it.isAccessible()) {
            return; // Event map is empty.
        } else if (it.pointer[1].tempoChange === undefined) {
            throw Error(`Missing starting tempo indication for juggler ${this.name}`);
        }
        // Finds all tempo changes.
        let tempoChanges: [MusicTime, Fraction][] = [];
        for (const [time, event] of this.events) {
            if (event.tempoChange?.lte(0)) {
                throw Error("Tempo <= 0.");
            }
            if (event.tempoChange !== undefined) {
                tempoChanges.push([time, event.tempoChange]);
            }
        }
        // Adds ending tempo
        const [lastTime, lastTempo] = tempoChanges[tempoChanges.length - 1];
        // TODO : Convert MusicTime to absolute time to handle this kind of op.
        const endTimeOnRhythm = lastTime.add(
            lastTempo.mul(endTime.sub(lastTime).div(lastTempo).ceil())
        );
        tempoChanges.push([endTimeOnRhythm, new Fraction(0)]);
        // Checks if tempo changes happen on rhythm with previous tempo.
        // And populates the beats timeline.
        // TODO : Remove ?
        for (let i = 0; i < tempoChanges.length - 1; i++) {
            const [time1, tempo] = tempoChanges[i];
            const time2 = tempoChanges[i + 1][0];
            if (!time2.sub(time1).div(tempo).divisible(1)) {
                throw Error("TODO : Tempo change not in sync.");
            }
            for (let t = time1; t.lt(time2); t = t.add(tempo)) {
                this.beats.setElement(t, undefined);
            }
        }
    }
}

//TODO : V1 Only with one throw per beat
//TODO : V2 Allow multiplex
//TODO : V3 Allow multihand
//TODO : V4 Allow Siteswap
//TODO : Changing tempo
//TODO : Offset tempo
//TODO : Offset tempo by "irrational number"
//TODO :
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
