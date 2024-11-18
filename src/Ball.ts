import * as THREE from "three";
import { createRBTree, RBTree } from "./RBTree";
import { GRAVITY } from "./constants";
import {
    AbstractBallHandEvent,
    BallEventInterface,
    CatchEvent,
    JugglingEvent,
    TablePutEvent,
    TableTakeEvent,
    Timeline
} from "./Timeline";
import * as Tone from "tone";
import { Table } from "./Table";

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

    /**
     * @param time The time in seconds.
     * @returns The position of the ball at that given time.
     */
    position(time: number): THREE.Vector3 {
        const [t0, prev_event] = this.timeline.prev_event(time);
        const [t1, next_event] = this.timeline.next_event(time);

        // Cases when one of the event is undefined.
        if (prev_event === null && next_event === null) {
            if (this.default_table === undefined) {
                throw new Error("No event in the timeline to determine where the ball is.");
            }
            return this.default_table.global_ball_position(this.name);
        }
        if (prev_event === null) {
            if (next_event instanceof CatchEvent) {
                throw new Error("Ball is caught at the beginning without being thrown.");
            } else if (next_event instanceof ThrowEvent) {
                return next_event!.get_place_global_position(time);
            } else if (next_event instanceof TablePutEvent) {
            } else if (next_event instanceof TableTakeEvent) {
            }
        }
        if (next_event === undefined) {
            if (prev_event.is_thrown) {
                throw new Error("Ball is thrown at the end without being caught.");
            } else if (prev_event.is_caught) {
                return prev_event.get_place_global_position(time);
            } else {
                //return prev_event.t;
                return new THREE.Vector3(0, 0, 0);
            }
        }

        // Cases where both events exist.
        // Whatever the second is, we throw the ball looking at starting and ending sites.
        if (prev_event.is_thrown) {
            return Ball.get_airborne_position(
                prev_event.get_global_position(),
                prev_event.time,
                next_event.get_global_position(),
                next_event.time,
                time
            );
        } else {
            return prev_event.get_place_global_position(time);
        }
    }

    static velocity_at_event(event: BallEventInterface): THREE.Vector3;
    static velocity_at_event(
        pos0: THREE.Vector3,
        t0: number,
        pos1: THREE.Vector3,
        t1: number,
        is_thrown: boolean
    ): THREE.Vector3 {
        if (event instanceof Event) const dt = t1 - t0;
        const v0x = (pos1.x - pos0.x) / dt;
        const v0z = (pos1.z - pos0.z) / dt;
        const v0y = (dt * GRAVITY) / 2 + (pos1.y - pos0.y) / dt;
        const throw_sign = is_thrown ? 1 : -1;
        return new THREE.Vector3(v0x, throw_sign * v0y, v0z);
    }

    static get_airborne_position(
        pos0: THREE.Vector3,
        t0: number,
        pos1: THREE.Vector3,
        t1: number,
        t: number
    ): THREE.Vector3 {
        const v0 = this.velocity_at_event(pos0, t0, pos1, t1, true);
        return new THREE.Vector3(
            v0.x * (t - t0) + pos0.x,
            (-GRAVITY / 2) * (t - t0) ** 2 + v0.y * (t - t0) + pos0.y,
            v0.z * (t - t0) + pos0.z
        );
    }

    static get_airborne_velocity(
        pos0: THREE.Vector3,
        t0: number,
        pos1: THREE.Vector3,
        t1: number,
        t: number
    ): THREE.Vector3 {
        const v0 = this.velocity_at_event(pos0, t0, pos1, t1, true);
        return new THREE.Vector3(v0.x, -GRAVITY * t + v0.y, v0.z);
    }

    /**
     * @param time The time in seconds
     * @returns The velocity of the ball at that given time.
     */
    get_velocity(time: number) {
        const prev_event = this.timeline.le(time).value;
        const next_event = this.timeline.gt(time).value;

        if (prev_event === undefined && next_event === undefined) {
            //TODO : Change -> On table (but which one)
            throw new Error("No event in the timeline to determine where the ball is.");
        }
        if (prev_event === undefined) {
            if (next_event!.hand_status === "CATCH") {
                throw new Error("Ball is caught at the beginning without being thrown.");
            }
            if (next_event!.hand_status === "THROW") {
                return next_event!.get_place_global_velocity(time);
            }
            return new THREE.Vector3(0, 0, 0);
        }
        if (next_event === undefined) {
            if (prev_event.hand_status === "THROW") {
                throw new Error("Ball is thrown at the end without being caught.");
            }
            if (prev_event.hand_status === "CATCH") {
                return prev_event.get_place_global_velocity(time);
            }
            return new THREE.Vector3(0, 0, 0);
        }

        // Cases where both events exist.
        if (prev_event.hand_status === "THROW") {
            //TODO : Check next_event is not throw to catch errors early.
            return Ball.get_airborne_velocity(
                prev_event.get_global_position(),
                prev_event.time,
                next_event.get_global_position(),
                next_event.time,
                time
            );
        }
        if (prev_event.hand_status === "CATCH") {
            return prev_event.get_place_global_velocity(time);
        }
        return prev_event.get_place_global_position(time);
    }

    //TODO : make it so that event.sound if array or undefined in constructor ?
    //TODO : method should rather be in simulator ?
    play_on_catch(time: number): void {
        const prev_event = this.timeline.le(time).value;
        if (prev_event !== undefined && prev_event.is_caught && this._prev_time < prev_event.time) {
            // Play a sound
            if (this.sound instanceof Tone.Players) {
                if (prev_event.sound_name !== undefined) {
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
        this.timeline = createRBTree();
    }
}

export { Ball };
