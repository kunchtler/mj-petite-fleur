import { Ball } from "./Ball";
import { Hand } from "./Hand";
import { Table } from "./Table";
import { OrderedMap } from "js-sdsl";

//TODO : Pb d'avoir get_abll_position ici : pos de la main et de la balle ne sont pas les mêmes
// (légérement au dessus par exemple)
//TODO : Really needs references if can be gathered from the ball timeline ?
//TODO : Dual condition (instanceof hand / table, and status). Create custom class instancing each other to fix this.
//Generic class with only type instancing ?

//TODO : Timeline fait intermédiaire entre main et balle. Balle ne peut pas accéder main, et inversement ?
// Mais comment gérer le temps ?
//TODO : Cache tree iterator ?
//TODO : Replace with OrderedMap<number, EventType>.
// In case of Ball, it is BallEvent, else it is HandEvent
// class Timeline<EventType> extends OrderedMap<number, EventType[]> {
//     constructor(initial_events?: [number, EventType | EventType[]][]) {
//         let container: [number, EventType[]][];
//         if (initial_events !== undefined) {
//             container = initial_events.map(([time, value]) => {
//                 return [time, Array.isArray(value) ? value : [value]];
//             });
//         } else {
//             container = [];
//         }
//         super(container);
//     }

//     //TODO : time redundant if in EventType ?
//     prev_event(time: number): [number, EventType[]] | [null, null] {
//         const it = this.reverseLowerBound(time);
//         //We make a copy of the contents of the list because the list itself
//         //is a proxy otherwise (which has unexpected console.logs to watch out for)
//         return it.isAccessible() ? [...it.pointer] : [null, null];
//     }

//     next_event(time: number): [number, EventType[]] | [null, null] {
//         const it = this.upperBound(time);
//         return it.isAccessible() ? [...it.pointer] : [null, null];
//     }
// }

export class Timeline<KeyType, EventType> extends OrderedMap<KeyType, EventType> {
    //TODO : time redundant if in EventType ?
    //TODO : Remove time
    //TODO : Methods to create / modify / delete events without interacting with OrderedMap directly ?
    //TODO : Rename key to time ?
    // (and to not mess up modifying or fusing of events for instance)
    prevEvent(time: KeyType, strict = false): [KeyType, EventType] | [null, null] {
        const it = strict ? this.reverseUpperBound(time) : this.reverseLowerBound(time);
        //We make a copy of the contents of the list because the list itself
        //is a proxy otherwise (which has unexpected console.logs to watch out for)
        return it.isAccessible() ? [...it.pointer] : [null, null];
    }

    nextEvent(time: KeyType, strict = true): [KeyType, EventType] | [null, null] {
        const it = strict ? this.upperBound(time) : this.lowerBound(time);
        return it.isAccessible() ? [...it.pointer] : [null, null];
    }

    setElements(it: [KeyType, EventType][]): void {
        for (const [key, event] of it) {
            this.setElement(key, event);
        }
    }

    startTime(): KeyType | null {
        const it = this.begin();
        return it.isAccessible() ? it.pointer[0] : null;
    }

    endTime(): KeyType | null {
        const it = this.rBegin();
        return it.isAccessible() ? it.pointer[0] : null;
    }

    prettyPrint(
        stringifyKey?: (key: KeyType) => string,
        stringifyElem?: (elem: EventType) => string
    ): void {
        this.forEach(([time, event]) => {
            console.log(
                `${stringifyKey === undefined ? time : stringifyKey(time)} : \
                ${stringifyElem === undefined ? event : stringifyElem(event)}`
            );
        });
    }
}

export class BaseEvent {
    time: number;

    constructor({ time }: { time: number }) {
        this.time = time;
    }

    // random_sound_name(): string {
    //     if (Array.isArray(this.soundName)) {
    //         const random_idx = Math.floor(Math.random() * this.soundName.length);
    //         return this.soundName[random_idx];
    //     } else if (typeof this.soundName === "string") {
    //         return this.soundName;
    //     } else {
    //         throw new Error("No sound_names have been provided.");
    //     }
    // }
}

export interface BallEventInterface extends BaseEvent {
    ball: Ball;
    errorBallStatus: string;
    nextBallEvent(): [number, BallTimelineEvent] | [null, null];
    prevBallEvent(): [number, BallTimelineEvent] | [null, null];
    playSound?: string;
    // playSoundTillNextEvent?: string;
}

//TODO : Handle unit_time ?
//TODO : Remove time from BaseEvent and only rely on the one of the timeline ?
//TODO : Remove next_hand_event and prev_hand_event from Catch/Throw ? (instead only have hand)
export interface HandEventInterface extends BaseEvent {
    hand: Hand;
    unitTime: number;
    nextHandEvent(): [number, HandTimelineEvent] | [null, null];
    prevHandEvent(): [number, HandTimelineEvent] | [null, null];
}

export class AbstractBallHandEvent extends BaseEvent implements BallEventInterface, HandEventInterface {
    private _ballRef: WeakRef<Ball>;
    private _handRef: WeakRef<Hand>;
    unitTime: number;
    readonly errorBallStatus: string = "unnamed attribute";
    playSound?: string;

    constructor({
        time,
        unitTime,
        playSound,
        ball,
        hand
    }: {
        time: number;
        unitTime: number;
        playSound?: string;
        ball: Ball;
        hand: Hand;
    }) {
        super({ time });
        this.unitTime = unitTime;
        this._ballRef = new WeakRef(ball);
        this._handRef = new WeakRef(hand);
        this.playSound = playSound;
    }

    get ball(): Ball {
        const obj = this._ballRef.deref();
        if (obj === undefined) {
            throw new Error("hand is undefined");
        }
        return obj;
    }

    set ball(new_ball: Ball) {
        this._ballRef = new WeakRef(new_ball);
    }

    get hand(): Hand {
        const obj = this._handRef.deref();
        if (obj === undefined) {
            throw new Error("hand is undefined");
        }
        return obj;
    }

    set hand(new_hand: Hand) {
        this._handRef = new WeakRef(new_hand);
    }

    prevBallEvent(): [number, BallTimelineEvent] | [null, null] {
        return this.ball.timeline.prevEvent(this.time, true);
    }

    nextBallEvent(): [number, BallTimelineEvent] | [null, null] {
        return this.ball.timeline.nextEvent(this.time);
    }

    prevHandEvent(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.prevEvent(this.time, true);
    }

    nextHandEvent(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.nextEvent(this.time);
    }
}

//TODO : Move sound_name to AbstractBallEvent as we don't want hand to make sound.
export class AbstractHandEvent extends BaseEvent implements HandEventInterface {
    private _handRef: WeakRef<Hand>;
    unitTime: number;
    // private _cached_tree_iterator:

    constructor({ time, unitTime, hand }: { time: number; unitTime: number; hand: Hand }) {
        super({ time });
        this._handRef = new WeakRef(hand);
        this.unitTime = unitTime;
    }

    get hand(): Hand {
        const obj = this._handRef.deref();
        if (obj === undefined) {
            throw new Error("hand is undefined");
        }
        return obj;
    }

    set hand(new_hand: Hand) {
        this._handRef = new WeakRef(new_hand);
    }

    prevHandEvent(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.prevEvent(this.time, true);
    }

    nextHandEvent(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.nextEvent(this.time);
    }
}

export class AbstractTableEvent extends AbstractBallHandEvent {
    table: Table;

    constructor({
        time,
        unitTime,
        ball,
        hand,
        table,
        playSound
    }: {
        time: number;
        unitTime: number;
        ball: Ball;
        hand: Hand;
        table: Table;
        playSound?: string;
    }) {
        super({ time, unitTime, ball, hand, playSound });
        this.table = table;
    }
}

export class ThrowEvent extends AbstractBallHandEvent {
    readonly errorBallStatus = "thrown";
}

export class CatchEvent extends AbstractBallHandEvent {
    readonly errorBallStatus = "caught";
}

export class TablePutEvent extends AbstractTableEvent {
    readonly errorBallStatus = "put on table";
}

export class TableTakeEvent extends AbstractTableEvent {
    readonly errorBallStatus = "taken from table";
}

export class HandMultiEvent<T extends HandEventInterface> extends AbstractHandEvent {
    events: T[];
    constructor({
        time,
        unitTime,
        hand,
        events
    }: {
        time: number;
        unitTime: number;
        hand: Hand;
        events?: T[];
    }) {
        super({ time, unitTime, hand });
        this.events = events ?? [];
    }
}

// class MultiThrowCatchEvent extends HandMultiEvent<CatchEvent | ThrowEvent> {} //TODO Implement this
//TODO : move ball error status to AbstractBallEvent only (not hand)
//TODO : Replace TablePutEvent / TableTakeEvent with MultiHandEvent<TablePutEvent | TableTakeEvent> ?
export type HandTimelineEvent =
    | HandMultiEvent<CatchEvent | ThrowEvent>
    | TablePutEvent
    | TableTakeEvent;
export type BallTimelineEvent = CatchEvent | ThrowEvent | TablePutEvent | TableTakeEvent;

// type ValidHandEventPair = [null, null | ThrowEvent | TablePutEvent | TableTakeEvent] | [CatchEvent, null | ThrowEvent | TablePutEvent] | [ThrowEvent, CatchEvent | TablePutEvent] | [TablePutEvent, TableTakeEvent] | [TableTakeEvent, null | ThrowEvent | TablePutEvent];
// type ValidBallEventPair = [];

/*
if (prev_event === null) {
    if (next_event === null) {}
    if (next_event instanceof CatchEvent) {}
    if (next_event instanceof ThrowEvent) {}
    if (next_event instanceof TablePutEvent) {}
    if (next_event instanceof TableTakeEvent) {}
}
if (prev_event instanceof CatchEvent) {
    if (next_event === null) {}
    if (next_event instanceof CatchEvent) {}
    if (next_event instanceof ThrowEvent) {}
    if (next_event instanceof TablePutEvent) {}
    if (next_event instanceof TableTakeEvent) {}
}
if (prev_event instanceof ThrowEvent) {
    if (next_event === null) {}
    if (next_event instanceof CatchEvent) {}
    if (next_event instanceof ThrowEvent) {}
    if (next_event instanceof TablePutEvent) {}
    if (next_event instanceof TableTakeEvent) {}
}
if (prev_event instanceof TablePutEvent) {
    if (next_event === null) {}
    if (next_event instanceof CatchEvent) {}
    if (next_event instanceof ThrowEvent) {}
    if (next_event instanceof TablePutEvent) {}
    if (next_event instanceof TableTakeEvent) {}
}
if (prev_event instanceof TableTakeEvent) {
    if (next_event === null) {}
    if (next_event instanceof CatchEvent) {}
    if (next_event instanceof ThrowEvent) {}
    if (next_event instanceof TablePutEvent) {}
    if (next_event instanceof TableTakeEvent) {}
}
throw Error("Unimplemented behaviour");
*/

// class HandCustomMovementEvent {}
