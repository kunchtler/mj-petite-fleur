import * as THREE from "three";
import { GRAVITY } from "./constants";
import {
    BallEventInterface,
    CatchEvent,
    ThrowEvent,
    TablePutEvent,
    TableTakeEvent,
    Timeline,
    BaseEvent
} from "./Timeline";
import * as Tone from "tone";
import { Table } from "./Table";

function thrown_ball_velocity_at_start_end(
    pos0: THREE.Vector3,
    t0: number,
    pos1: THREE.Vector3,
    t1: number,
    at_start: boolean
): THREE.Vector3 {
    const dt = t1 - t0;
    const v0x = (pos1.x - pos0.x) / dt;
    const v0z = (pos1.z - pos0.z) / dt;
    const v0y = (dt * GRAVITY) / 2 + (pos1.y - pos0.y) / dt;
    const throw_sign = at_start ? 1 : -1;
    return new THREE.Vector3(v0x, throw_sign * v0y, v0z);
}

function thrown_ball_position(
    pos0: THREE.Vector3,
    t0: number,
    pos1: THREE.Vector3,
    t1: number,
    t: number
): THREE.Vector3 {
    const v0 = thrown_ball_velocity_at_start_end(pos0, t0, pos1, t1, true);
    return new THREE.Vector3(
        v0.x * (t - t0) + pos0.x,
        (-GRAVITY / 2) * (t - t0) ** 2 + v0.y * (t - t0) + pos0.y,
        v0.z * (t - t0) + pos0.z
    );
}

// function thrown_ball_velocity(
//     pos0: THREE.Vector3,
//     t0: number,
//     pos1: THREE.Vector3,
//     t1: number,
//     t: number
// ): THREE.Vector3 {
//     const v0 = thrown_ball_velocity_at_start_end(pos0, t0, pos1, t1, true);
//     return new THREE.Vector3(v0.x, -GRAVITY * t + v0.y, v0.z);
// }

interface BallConstructorInterface {
    color: number | string;
    radius: number;
    name?: string;
    sound?: Tone.Players | Tone.Player | string;
    panner3D?: Tone.Panner3D;
    timeline?: Timeline<BallEventInterface>;
    default_table?: Table;
}

// function create_audio(note_name: string): HTMLAudioElement {
//     throw new Error("Not implemented");
// }

//TODO : Fusionner les évènements de main et de balles ?
//TODO : Defaults for constructors here and in simulator
//TODO : Checks that hand/ball examined is indeed for this ball / hand and not another ?

class Ball {
    readonly color: number | string;
    readonly radius: number;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    mesh: THREE.Mesh;
    name: string;
    timeline: Timeline<BallEventInterface>;
    sound?: Tone.Players | Tone.Player;
    panner3D?: Tone.Panner3D;
    default_table?: Table;
    private _prev_time = 0;

    constructor({
        color,
        radius,
        name,
        sound,
        panner3D,
        timeline,
        default_table
    }: BallConstructorInterface) {
        this.color = color;
        this.radius = radius;
        this.geometry = new THREE.SphereGeometry(radius, 8, 8);
        this.material = new THREE.MeshPhongMaterial({ color: this.color });
        //TODO: CHeck if destroying mesh detroys material and or geometry.
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        if (timeline === undefined) {
            this.timeline = new Timeline();
        } else {
            this.timeline = structuredClone(timeline);
        }

        if (typeof sound === "string") {
            // Define a ball by its note.
            throw new Error("Not implemented yet");
        }
        this.sound = sound;
        this.panner3D = panner3D;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        this.name = name !== undefined ? name : "None";
        this.default_table = default_table;
    }

    //TODO : Move this as static for events
    throw_timeline_error(event1: BaseEvent | null, event2: BaseEvent | null): void {
        const str1 =
            event1 === null
                ? `has previous event null`
                : `is ${event1.error_ball_status} at time ${event1.time}`;
        const str2 =
            event2 === null
                ? `has previous event null`
                : `is ${event2.error_ball_status} at time ${event2.time}`;
        throw Error(`Ball ${this.name} ${str1} and ${str2}.`);
    }

    position_at_event(event: BallEventInterface | null): THREE.Vector3 {
        if (event === null) {
            throw Error();
        } else if (
            event instanceof CatchEvent ||
            event instanceof ThrowEvent ||
            event instanceof TableTakeEvent
        ) {
            //TableTakeEvent for now here as the ball teleports from table to hand, so is in hand.
            //With proper animations, could change.
            return event.hand.position_at_event(event);
        } else if (event instanceof TablePutEvent) {
            return event.table.ball_position(this.name);
        }
        throw Error("Unimplemented behaviour");
    }

    //TODO : Logique des enchainements d'evenement pour la balle éparpillé dans le code...
    //TODO : Change hand.position to hand.ball_position
    /**
     * @param time The time in seconds.
     * @returns The position of the ball at that given time.
     */
    position(time: number): THREE.Vector3 {
        const [, prev_event] = this.timeline.prev_event(time);
        const [, next_event] = this.timeline.next_event(time);

        if (prev_event === null) {
            if (next_event === null) {
                if (this.default_table === undefined) {
                    this.throw_timeline_error(prev_event, next_event);
                } else {
                    return this.default_table.ball_position(this.name);
                }
            }
            if (next_event instanceof CatchEvent) {
                this.throw_timeline_error(prev_event, next_event);
            }
            if (next_event instanceof ThrowEvent || next_event instanceof TablePutEvent) {
                return next_event.hand.position(time);
            }
            if (next_event instanceof TableTakeEvent) {
                return next_event.table.ball_position(this.name);
            }
        }
        if (prev_event instanceof CatchEvent) {
            if (
                next_event === null ||
                next_event instanceof ThrowEvent ||
                next_event instanceof TablePutEvent
            ) {
                return prev_event.hand.position(time);
            }
            if (next_event instanceof CatchEvent || next_event instanceof TableTakeEvent) {
                this.throw_timeline_error(prev_event, next_event);
            }
        }
        if (prev_event instanceof ThrowEvent) {
            if (next_event instanceof CatchEvent) {
                return thrown_ball_position(
                    prev_event.hand.position_at_event(prev_event),
                    prev_event.time,
                    next_event.hand.position_at_event(next_event),
                    next_event.time,
                    time
                );
            }
            if (next_event instanceof TablePutEvent) {
                return thrown_ball_position(
                    prev_event.hand.position_at_event(prev_event),
                    prev_event.time,
                    next_event.table.ball_position(this.name),
                    next_event.time,
                    time
                );
            }
            if (
                next_event === null ||
                next_event instanceof ThrowEvent ||
                next_event instanceof TableTakeEvent
            ) {
                this.throw_timeline_error(prev_event, next_event);
            }
        }
        if (prev_event instanceof TablePutEvent) {
            if (next_event === null || next_event instanceof TableTakeEvent) {
                return prev_event.table.ball_position(this.name);
            }
            if (
                next_event instanceof CatchEvent ||
                next_event instanceof ThrowEvent ||
                next_event instanceof TablePutEvent
            ) {
                this.throw_timeline_error(prev_event, next_event);
            }
        }
        if (prev_event instanceof TableTakeEvent) {
            if (
                next_event === null ||
                next_event instanceof ThrowEvent ||
                next_event instanceof TablePutEvent
            ) {
                return prev_event.hand.position(time);
            }
            if (next_event instanceof CatchEvent || next_event instanceof TableTakeEvent) {
                this.throw_timeline_error(prev_event, next_event);
            }
        }
        throw Error("Unimplemented behaviour");
    }

    //Rename velocity_at_event ?
    //TODO : Un seul type pour BallEvent : BallEventInterface | null ?
    velocity_at_catch_throw_event(event: CatchEvent | ThrowEvent): THREE.Vector3 {
        let prev_event: BallEventInterface | null;
        let next_event: BallEventInterface | null;
        let is_thrown: boolean;
        if (event instanceof CatchEvent) {
            prev_event = event.prev_ball_event()[1];
            next_event = event;
            is_thrown = false;
        } else {
            prev_event = event;
            next_event = event.next_ball_event()[1];
            is_thrown = true;
        }
        //Validation of events ?
        if (
            prev_event instanceof ThrowEvent &&
            (next_event instanceof CatchEvent || next_event instanceof TablePutEvent)
        ) {
            return thrown_ball_velocity_at_start_end(
                this.position_at_event(prev_event),
                prev_event.time,
                this.position_at_event(next_event),
                next_event.time,
                is_thrown
            );
        }
        throw Error("Unimplemented behaviour");
    }

    // /**
    //  * @param time The time in seconds
    //  * @returns The velocity of the ball at that given time.
    //  */
    // velocity(time: number) {
    //     const [t0, prev_event] = this.timeline.prev_event(time);
    //     const [t1, next_event] = this.timeline.next_event(time);

    //     if (prev_event === null) {
    //         if (next_event === null) {
    //             if (this.default_table === undefined) {
    //                 this.throw_timeline_error(prev_event, next_event);
    //             }
    //             return new THREE.Vector3(0, 0, 0);
    //         }
    //         if (next_event instanceof CatchEvent) {
    //             this.throw_timeline_error(prev_event, next_event);
    //         }
    //         if (next_event instanceof ThrowEvent || next_event instanceof TablePutEvent) {
    //             return next_event.hand.ball_velocity(this, time);
    //         }
    //         if (next_event instanceof TableTakeEvent) {
    //             return new THREE.Vector3(0, 0, 0);
    //         }
    //     }
    //     if (prev_event instanceof CatchEvent) {
    //         if (
    //             next_event === null ||
    //             next_event instanceof ThrowEvent ||
    //             next_event instanceof TablePutEvent
    //         ) {
    //             return prev_event.hand.ball_velocity(this, time);
    //         }
    //         if (next_event instanceof CatchEvent || next_event instanceof TableTakeEvent) {
    //             this.throw_timeline_error(prev_event, next_event);
    //         }
    //     }
    //     if (prev_event instanceof ThrowEvent) {
    //         if (next_event instanceof CatchEvent || next_event instanceof TablePutEvent) {
    //             return this.airborne_velocity(/*TODO*/);
    //             // return Ball.get_airborne_position(
    //             //     prev_event.get_global_position(),
    //             //     prev_event.time,
    //             //     next_event.get_global_position(),
    //             //     next_event.time,
    //             //     time
    //             // );
    //         }
    //         if (
    //             next_event === null ||
    //             next_event instanceof ThrowEvent ||
    //             next_event instanceof TableTakeEvent
    //         ) {
    //             this.throw_timeline_error(prev_event, next_event);
    //         }
    //     }
    //     if (prev_event instanceof TablePutEvent) {
    //         if (next_event === null || next_event instanceof TableTakeEvent) {
    //             return new THREE.Vector3(0, 0, 0);
    //         }
    //         if (
    //             next_event instanceof CatchEvent ||
    //             next_event instanceof ThrowEvent ||
    //             next_event instanceof TablePutEvent
    //         ) {
    //             this.throw_timeline_error(prev_event, next_event);
    //         }
    //     }
    //     if (prev_event instanceof TableTakeEvent) {
    //         if (
    //             next_event === null ||
    //             next_event instanceof ThrowEvent ||
    //             next_event instanceof TablePutEvent
    //         ) {
    //             return prev_event.hand.ball_velocity(this, time);
    //         }
    //         if (next_event instanceof CatchEvent || next_event instanceof TableTakeEvent) {
    //             this.throw_timeline_error(prev_event, next_event);
    //         }
    //     }
    //     throw Error("Unimplemented behaviour");
    // }

    //TODO : make it so that event.sound if array or undefined in constructor ?
    //TODO : method should rather be in simulator ?
    //TODO : Make it so if the ball has sounds, there are options to play on every event, or catch, or throw.
    //TODO : Make it so if the ball falls after a throw it makes a sound
    play_on_catch(time: number): void {
        const prev_event = this.timeline.prev_event(time)[1];
        if (
            prev_event !== null &&
            prev_event instanceof ThrowEvent &&
            this._prev_time <= prev_event.time
        ) {
            // Play a sound
            if (this.sound instanceof Tone.Players) {
                if (prev_event.sound_name !== null) {
                    const sound_name = prev_event.random_sound_name();
                    this.sound.player(sound_name).start();
                }
            } else if (this.sound instanceof Tone.Player) {
                this.sound.start();
            }
        }
        this._prev_time = time;
    }

    /**
     * Updates the ball's position.
     * @param time Time of the frame to render in seconds.
     */
    render = (time: number): void => {
        //Receives the time in seconds.
        const position = this.position(time);
        this.mesh.position.copy(position);
        this.panner3D?.setPosition(position.x, position.y, position.z);
    };

    /**
     * Properly deletes the resources. Call when instance is not needed anymore to free ressources. nullify all reference
     */
    dispose() {
        if (this.mesh.parent !== null) {
            this.mesh.parent.remove(this.mesh);
        }
        this.geometry.dispose();
        this.material.dispose();
        if (this.sound instanceof Tone.Player) {
            this.sound.stop();
        } else if (this.sound instanceof Tone.Players) {
            this.sound.stopAll();
        }
        this.sound?.dispose();
        this.panner3D?.dispose();
        this.timeline.clear();
    }
}

export { Ball };
