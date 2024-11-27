import { Ball } from "./Ball";
import { Hand } from "./Hand";
import { Table } from "./Table";
import { OrderedMap } from "js-sdsl";

//TODO : Gestion des corrodonnées globales / locales
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
    // ball_position(): THREE.Vector3;
    // ball_velocity(): THREE.Vector3;
}

//TODO : Handle unit_time ?
//TODO : Remove time from BaseEvent and only rely on the one of the timeline ?
//TODO : Remove next_hand_event and prev_hand_event from Catch/Throw ? (instead only have hand)
export interface HandEventInterface extends BaseEvent {
    hand: Hand;
    unit_time: number;
    next_hand_event(): [number, HandTimelineEvent] | [null, null];
    prev_hand_event(): [number, HandTimelineEvent] | [null, null];
    // hand_position(): THREE.Vector3;
    // hand_velocity(): THREE.Vector3;
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

    // ball_position(): THREE.Vector3 {
    //     // return this.hand
    // }

    // ball_velocity(): THREE.Vector3 {
    //     const pos0 = this.ball_position();
    //     const pos1 = this.next_ball_event.ball_position();
    //     const t0 = this.time;
    //     const t1 = this.paired_event.time;
    //     if (this.is_thrown) {
    //         return Ball.airborne_velocity_at_endpoints(pos0, t0, pos1, t1, this.is_thrown);
    //     }
    //     //Can be caught in hand or on table
    //     return Ball.airborne_velocity_at_endpoints(pos1, t1, pos0, t0, this.is_thrown);
    // }
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

// export { AbstractBallHandEvent, Timeline };

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
// class BasicEvent {
//     time: number;
//     readonly ball_status: "AIRBORNE" | "HELD" | "TABLE";
//     readonly hand_status: "CATCH" | "THROW" | "TABLE";
//     private _ball_ref?: WeakRef<Ball>;
//     constructor(time: number) {
//         this.time = time;
//     }
//     get ball(): Ball {
//         const obj = this._ball_ref?.deref();
//         if (obj === undefined) {
//             throw new Error("hand is undefined");
//         }
//         return obj;
//     }
//     set ball(new_ball: Ball) {
//         this._ball_ref = new WeakRef(new_ball);
//     }
// }

// class TableEvent extends BasicEvent {}
// class JugglingEvent /*extends BasicEvent*/ {
//     time: number;
//     unit_time: number;
//     /**
//      * The sound the ball should make the event occurs.
//      * The type of sound_name is in conjunction with the one of Ball.sound.
//      * If Ball.sound is of type Tone.Players, then sound can be either a string
//      * specifying which sound to play, or an array of them to choose randomly from.
//      * If Ball.sound if of type Tone.Player | undefined, sound should be undefined.
//      */
//     sound_name: string[] | string | undefined;
//     readonly ball_status: "AIRBORNE" | "HELD" | "TABLE";
//     readonly hand_status: "CATCH" | "THROW" | "TABLE";
//     private _ball_ref?: WeakRef<Ball>;
//     private _place_ref?: WeakRef<Hand | Table>;
//     private _paired_event_ref?: WeakRef<JugglingEvent>;

//     constructor(
//         time: number,
//         unit_time: number,
//         status: "CATCH" | "THROW" | "TABLE",
//         place?: Hand | Table,
//         ball?: Ball,
//         sound_name?: string[] | string
//     ) {
//         this.time = time;
//         this.unit_time = unit_time;
//         this._place_ref = place !== undefined ? new WeakRef<Hand | Table>(place) : undefined;
//         this._ball_ref = ball !== undefined ? new WeakRef<Ball>(ball) : undefined;
//         this.ball_status = status === "THROW" ? "AIRBORNE" : "HELD";
//         this.hand_status = status;
//         if (status === "THROW") {
//             this.ball_status = "AIRBORNE";
//         } else if (status === "CATCH") {
//             this.ball_status = "HELD";
//         } else {
//             this.ball_status = "TABLE";
//         }
//         this.sound_name = sound_name;
//     }

//     get place(): Hand | Table {
//         const obj = this._place_ref?.deref();
//         if (obj === undefined) {
//             throw new Error("hand is undefined");
//         }
//         return obj;
//     }

//     set place(new_hand: Hand | Table) {
//         this._place_ref = new WeakRef(new_hand);
//     }

//     get ball(): Ball {
//         const obj = this._ball_ref?.deref();
//         if (obj === undefined) {
//             throw new Error("hand is undefined");
//         }
//         return obj;
//     }

//     set ball(new_ball: Ball) {
//         this._ball_ref = new WeakRef(new_ball);
//     }

//     get paired_event(): JugglingEvent {
//         const event = this._paired_event_ref?.deref();
//         if (event === undefined) {
//             throw new Error("Paired Event is undefined.");
//         }
//         return event;
//     }

//     set paired_event(event: JugglingEvent) {
//         this._paired_event_ref = new WeakRef<JugglingEvent>(event);
//     }

//     pair_with(other: JugglingEvent): void {
//         other.paired_event = this;
//         this.paired_event = other;
//     }

//     //TODO: Offset the ball by its radius up ?
//     //TODO: Telle what is local/global
//     get_global_position(): THREE.Vector3 {
//         if (this.place instanceof Hand) {
//             const local_position = this.place.site_position(this.is_thrown);
//             return this.place.origin_object.localToWorld(local_position);
//         }
//         return this.place.ball_position(this.ball.name);
//     }

//     get_ball_velocity(): THREE.Vector3 {
//         const pos0 = this.get_global_position();
//         const pos1 = this.paired_event.get_global_position();
//         const t0 = this.time;
//         const t1 = this.paired_event.time;
//         if (this.is_thrown) {
//             return Ball.airborne_velocity_at_endpoints(pos0, t0, pos1, t1, this.is_thrown);
//         }
//         //Can be caught in hand or on table
//         return Ball.airborne_velocity_at_endpoints(pos1, t1, pos0, t0, this.is_thrown);
//     }

//     /**
//      * Asks the place where the event happens (hand or table) what its global velocity is at a given time.
//      * @param time
//      */
//     //TODO : CHANGE (see above)
//     get_place_global_position(time: number): THREE.Vector3 {
//         if (this.place instanceof Hand) {
//             return this.place.global_position(time);
//         }
//         return this.place.ball_position(this.ball.name);
//     }

//     /**
//      * Asks the place where the event happens (hand or table) what its global velocity is at a given time.
//      * @param time
//      */
//     //TODO : CHANGE (see above)
//     get_place_global_velocity(time: number): THREE.Vector3 {
//         if (this.place instanceof Hand) {
//             return this.place.global_velocity(time);
//         }
//         return new THREE.Vector3(0, 0, 0);
//     }

//     get is_thrown(): boolean {
//         return this.hand_status === "THROW";
//     }

//     get is_caught(): boolean {
//         return this.hand_status === "CATCH";
//     }

//     get is_on_table(): boolean {
//         return this.hand_status === "TABLE";
//     }

//     random_sound_name(): string {
//         if (Array.isArray(this.sound_name)) {
//             const random_idx = Math.floor(Math.random() * this.sound_name.length);
//             return this.sound_name[random_idx];
//         } else if (typeof this.sound_name === "string") {
//             return this.sound_name;
//         } else {
//             throw new Error("No sound_names have been provided.");
//         }
//     }
// }

// class ThrowEvent extends JugglingEvent {
//     siteswap_height: number;
//     ball_status = "AIRBORNE" as const;
//     hand_status = "THROW" as const;
//     private _catch_event_ref?: WeakRef<CatchEvent>;

//     constructor(
//         time: number,
//         unit_time: number,
//         siteswap_height: number,
//         hand?: Hand,
//         ball?: Ball,
//         catch_event?: CatchEvent
//     ) {
//         super(time, unit_time, hand, ball);
//         this.siteswap_height = siteswap_height;
//         if (catch_event !== undefined) {
//             this._catch_event_ref = new WeakRef<CatchEvent>(catch_event);
//         }
//     }

//     get catch_event(): CatchEvent {
//         const event = this._catch_event_ref?.deref();
//         if (event === undefined) {
//             throw new Error("Catch Event is undefined");
//         }
//         return event;
//     }

//     set catch_event(event: CatchEvent) {
//         this._catch_event_ref = new WeakRef<CatchEvent>(event);
//     }

//     pair_with(catch_event: CatchEvent): void {
//         catch_event.throw_event = this;
//         this.catch_event = catch_event;
//     }
// }

// class CatchEvent extends JugglingEvent {
//     ball_status = "HELD" as const;
//     hand_status = "CATCH" as const;
//     private _throw_event_ref?: WeakRef<ThrowEvent>;

//     constructor(
//         time: number,
//         unit_time: number,
//         hand?: Hand,
//         ball?: Ball,
//         throw_event?: ThrowEvent
//     ) {
//         super(time, unit_time, hand, ball);
//         if (throw_event !== undefined) {
//             this._throw_event_ref = new WeakRef<ThrowEvent>(throw_event);
//         }
//     }

//     get throw_event(): ThrowEvent {
//         const event = this._throw_event_ref?.deref();
//         if (event === undefined) {
//             throw new Error("throw_event is undefined");
//         }
//         return event;
//     }

//     set throw_event(event: ThrowEvent) {
//         this._throw_event_ref = new WeakRef<ThrowEvent>(event);
//     }

//     pair_with(throw_event: ThrowEvent): void {
//         throw_event.pair_with(this);
//         // this.throw_event = throw_event;
//         // throw_event.catch_event = this;
//     }
// }

// class TableEvent extends JugglingEvent {
//     this.table: Table ;

//     constructor(time: number, unit_time: number, hand?: Hand, ball?: Ball) {
//         super(time, unit_time, hand, ball);
//     }
// }

// export { JugglingEvent };
