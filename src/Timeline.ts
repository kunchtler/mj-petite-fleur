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

export class Timeline<EventType> extends OrderedMap<number, EventType> {
    //TODO : time redundant if in EventType ?
    //TODO : Remove time
    //TODO : Methods to create / modify / delete events without interacting with OrderedMap directly ?
    // (and to not mess up modifying or fusing of events for instance)
    prev_event(time: number, strict = false): [number, EventType] | [null, null] {
        const it = strict ? this.reverseUpperBound(time) : this.reverseLowerBound(time);
        //We make a copy of the contents of the list because the list itself
        //is a proxy otherwise (which has unexpected console.logs to watch out for)
        return it.isAccessible() ? [...it.pointer] : [null, null];
    }

    next_event(time: number, strict = true): [number, EventType] | [null, null] {
        const it = strict ? this.upperBound(time) : this.lowerBound(time);
        return it.isAccessible() ? [...it.pointer] : [null, null];
    }

    pretty_print(): void {
        this.forEach(([, event]) => {
            console.log(event);
        });
    }
}

export class BaseEvent {
    time: number;
    sound_name: string[] | string | null;

    constructor({ time, sound_name }: { time: number; sound_name?: string[] | string | null }) {
        this.time = time;
        this.sound_name = sound_name === undefined ? null : sound_name;
    }

    random_sound_name(): string {
        if (Array.isArray(this.sound_name)) {
            const random_idx = Math.floor(Math.random() * this.sound_name.length);
            return this.sound_name[random_idx];
        } else if (typeof this.sound_name === "string") {
            return this.sound_name;
        } else {
            throw new Error("No sound_names have been provided.");
        }
    }
}

export interface BallEventInterface extends BaseEvent {
    ball: Ball;
    error_ball_status: string;
    next_ball_event(): [number, BallTimelineEvent] | [null, null];
    prev_ball_event(): [number, BallTimelineEvent] | [null, null];
}

//TODO : Handle unit_time ?
//TODO : Remove time from BaseEvent and only rely on the one of the timeline ?
//TODO : Remove next_hand_event and prev_hand_event from Catch/Throw ? (instead only have hand)
export interface HandEventInterface extends BaseEvent {
    hand: Hand;
    unit_time: number;
    next_hand_event(): [number, HandTimelineEvent] | [null, null];
    prev_hand_event(): [number, HandTimelineEvent] | [null, null];
}

export class AbstractBallHandEvent extends BaseEvent implements BallEventInterface, HandEventInterface {
    private _ball_ref: WeakRef<Ball>;
    private _hand_ref: WeakRef<Hand>;
    unit_time: number;
    readonly error_ball_status: string = "unnamed attribute";
    // private _cached_tree_iterator:

    constructor({
        time,
        unit_time,
        sound_name,
        ball,
        hand
    }: {
        time: number;
        unit_time: number;
        sound_name?: string[] | string | null;
        ball: Ball;
        hand: Hand;
    }) {
        super({ time, sound_name });
        this.unit_time = unit_time;
        this._ball_ref = new WeakRef(ball);
        this._hand_ref = new WeakRef(hand);
    }

    get ball(): Ball {
        const obj = this._ball_ref.deref();
        if (obj === undefined) {
            throw new Error("hand is undefined");
        }
        return obj;
    }

    set ball(new_ball: Ball) {
        this._ball_ref = new WeakRef(new_ball);
    }

    get hand(): Hand {
        const obj = this._hand_ref.deref();
        if (obj === undefined) {
            throw new Error("hand is undefined");
        }
        return obj;
    }

    set hand(new_hand: Hand) {
        this._hand_ref = new WeakRef(new_hand);
    }

    prev_ball_event(): [number, BallTimelineEvent] | [null, null] {
        return this.ball.timeline.prev_event(this.time, true);
    }

    next_ball_event(): [number, BallTimelineEvent] | [null, null] {
        return this.ball.timeline.next_event(this.time);
    }

    prev_hand_event(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.prev_event(this.time, true);
    }

    next_hand_event(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.next_event(this.time);
    }
}

//TODO : Move sound_name to AbstractBallEvent as we don't want hand to make sound.
export class AbstractHandEvent extends BaseEvent implements HandEventInterface {
    private _hand_ref: WeakRef<Hand>;
    unit_time: number;
    // private _cached_tree_iterator:

    constructor({
        time,
        unit_time,
        sound_name,
        hand
    }: {
        time: number;
        unit_time: number;
        sound_name?: string[] | string | null;
        hand: Hand;
    }) {
        super({ time, sound_name });
        this._hand_ref = new WeakRef(hand);
        this.unit_time = unit_time;
    }

    get hand(): Hand {
        const obj = this._hand_ref.deref();
        if (obj === undefined) {
            throw new Error("hand is undefined");
        }
        return obj;
    }

    set hand(new_hand: Hand) {
        this._hand_ref = new WeakRef(new_hand);
    }

    prev_hand_event(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.prev_event(this.time, true);
    }

    next_hand_event(): [number, HandTimelineEvent] | [null, null] {
        return this.hand.timeline.next_event(this.time);
    }
}

export class AbstractTableEvent extends AbstractBallHandEvent {
    table: Table;

    constructor({
        time,
        unit_time,
        sound_name,
        ball,
        hand,
        table
    }: {
        time: number;
        unit_time: number;
        sound_name?: string[] | string | null;
        ball: Ball;
        hand: Hand;
        table: Table;
    }) {
        super({ time, unit_time, sound_name, ball, hand });
        this.table = table;
    }
}

export class ThrowEvent extends AbstractBallHandEvent {
    readonly error_ball_status = "thrown";
}

export class CatchEvent extends AbstractBallHandEvent {
    readonly error_ball_status = "caught";
}

export class TablePutEvent extends AbstractTableEvent {
    readonly error_ball_status = "put on table";
}

export class TableTakeEvent extends AbstractTableEvent {
    readonly error_ball_status = "taken from table";
}

export class HandMultiEvent<T extends HandEventInterface> extends AbstractHandEvent {
    events: T[];
    constructor({
        time,
        unit_time,
        sound_name,
        hand,
        events
    }: {
        time: number;
        unit_time: number;
        sound_name?: string[] | string | null;
        hand: Hand;
        events?: T[];
    }) {
        super({ time, unit_time, sound_name, hand });
        this.events = events ?? [];
    }
}

class MultiThrowCatchEvent extends HandMultiEvent<CatchEvent | ThrowEvent> {
} //TODO Implement this
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

