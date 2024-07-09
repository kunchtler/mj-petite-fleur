/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as THREE from "three";
import { resizeRendererToDisplaySize, Simulator } from "./Simulator";
import { Ball } from "./Ball";
import { create_juggler_mesh, Juggler } from "./Juggler";
import * as TWEAKPANE from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { JugglingEvent } from "./Timeline";
import { Hand } from "./Hand";
import * as Tone from "tone";
import { MyVisitor, pier, tree } from "./ParserLexerPattern";

//TODO : With react, handle volume button being pressed as interaction ?
//TODO : Test on phone if touch correctly starts audio
//TODO : Add the option for no audio/normal audio/spatialized audio
//TODO : Add option to mute a juggler/some balls ?
//TODO : Camlecase or underscores ?
//TODO Bugged buffer load if not await in main code.
//TODO : Put code in simulator
//TODO : Remove the fact that hand get closer depending on unit time (simplifies code)
//TODO : Cap Hand movement
//TODO : Implement juggler model
//TODO : Merge juggler geometries

const transport = Tone.getTransport();
// const transport = new TransportPlayback();
const context = Tone.getContext();

const handle_load_end = (function () {
    let load_ready = 0;
    return function () {
        load_ready++;
        if (load_ready === 2) {
            const wait_screen = document.querySelector("#wait_screen");
            if (!(wait_screen instanceof Element)) {
                throw new Error();
            }
            wait_screen.classList.add("fade_out");
            wait_screen.addEventListener("animationend", () => {
                wait_screen.remove();
            });
        }
    };
})();

// Handling of the first user input before playing audio.
const first_interaction_event_types = ["mousedown", "keydown", "touchstart"];

async function handle_first_interaction(event: Event) {
    for (const event_type of first_interaction_event_types) {
        event.currentTarget?.removeEventListener(event_type, handle_first_interaction, true);
    }
    const text_element = document.querySelector("#wait_user");
    if (!(text_element instanceof HTMLParagraphElement)) {
        throw new Error();
    }
    text_element.textContent = "User interaction detected ✔️";
    await Tone.start();
    handle_load_end();
    //We block the promise until resolved
    // await Tone.start()
    //     .then(() => {
    //         console.log("User interaction detected. Ready to play audio");
    //         return Tone.loaded();
    //     })
    //     .then(() => {
    //         console.log("Audio buffers all loaded !");
    //         //transport.start();
    //     })
    //     .catch((reason: unknown) => {
    //         throw new Error(`Unable to setup the audio to play. Reason : ${reason}`);
    //         //console.log(reason);
    //     });
}

for (const event_type of first_interaction_event_types) {
    document.body.addEventListener(event_type, handle_first_interaction, true);
}

async function handle_sounds_loaded() {
    await Tone.loaded();
    const text_element = document.querySelector("#wait_load");
    if (!(text_element instanceof HTMLParagraphElement)) {
        throw new Error();
    }
    text_element.textContent = "Sound loaded ✔️";
    handle_load_end();
}

const sfx_buffers = {
    heavy_hit1: new Tone.ToneAudioBuffer("grelot_balls_sfx/heavy_hit1.mp3"),
    heavy_hit2: new Tone.ToneAudioBuffer("grelot_balls_sfx/heavy_hit2.mp3"),
    heavy_hit3: new Tone.ToneAudioBuffer("grelot_balls_sfx/heavy_hit3.mp3"),
    normal_hit1: new Tone.ToneAudioBuffer("grelot_balls_sfx/normal_hit1.mp3"),
    normal_hit2: new Tone.ToneAudioBuffer("grelot_balls_sfx/normal_hit2.mp3"),
    weak_hit1: new Tone.ToneAudioBuffer("grelot_balls_sfx/weak_hit1.mp3"),
    weak_hit2: new Tone.ToneAudioBuffer("grelot_balls_sfx/weak_hit2.mp3"),
    shaker: new Tone.ToneAudioBuffer("grelot_balls_sfx/shaker.mp3"),
    weak_hit_shaker: new Tone.ToneAudioBuffer("grelot_balls_sfx/weak_hit_shaker.mp3")
};

const weak_hit = ["weak_hit1", "weak_hit2"];
const normal_hit = ["normal_hit1", "normal_hit2"];
const heavy_hit = ["heavy_hit1", "heavy_hit2", "heavy_hit3"];

const music = new Audio("petite_fleur_vincent.mp3");
const music_tone = context.createMediaElementSource(music);
const music_gain = new Tone.Gain().toDestination();
Tone.connect(music_tone, music_gain);
const sfx_gain = new Tone.Gain().toDestination();
sfx_gain.gain.value = 0;
music_gain.gain.value = 0;

music.addEventListener("canplaythrough", handle_sounds_loaded, { once: true });

const simulator = new Simulator("#simulator_canvas");
const scene = simulator.scene;
const renderer = simulator.renderer;
const camera = simulator.camera;

//create_juggler_mesh(scene, 2.0, 0.5, 0.3);

simulator.jugglers = [new Juggler(2.0)];
const vincent = simulator.jugglers[0];
vincent.mesh.position.set(-1, 0, 1);
vincent.mesh.rotateY(Math.PI / 2);

//TODO : Handle properly this await (by loading the sounds for the balls only when Tone has loaded the buffer.)
await Tone.loaded();
for (const color of ["red", "green", "blue"]) {
    const player = new Tone.Players(sfx_buffers);
    const panner = new Tone.Panner3D({ panningModel: "HRTF", rolloffFactor: 1 });
    player.connect(panner);
    panner.connect(sfx_gain);
    simulator.balls.push(new Ball(color, 0.08, player, panner));
}

function lance(
    ball: Ball,
    time: number,
    flight_time: number,
    source: Hand,
    target: Hand,
    unit_time: number,
    sound?: string[] | string
): void {
    const ev1 = new JugglingEvent(time, unit_time, "THROW", source, ball);
    const ev2 = new JugglingEvent(time + flight_time, unit_time, "CATCH", target, ball, sound);
    ev1.pair_with(ev2);
    ball.timeline = ball.timeline.insert(ev1.time, ev1);
    ball.timeline = ball.timeline.insert(ev2.time, ev2);
    source.timeline = source.timeline.insert(ev1.time, ev1);
    target.timeline = target.timeline.insert(ev2.time, ev2);
}

// Petite Fleur
// const left = vincent.left_hand;
// const right = vincent.right_hand;
// let ball0 = simulator.balls[0];
// let ball1 = simulator.balls[1];
// let ball2 = simulator.balls[2];
// const u = 60 / 265;
// const d = u / 3;
// // const t = 56.153;

// let t = 0;
// for (let i = 0; i < 10; i++) {
//     lance(ball0, t + 0 * u, 3.5 * u - d, left, left, u, heavy_hit);
//     lance(ball1, t + 1 * u, 4 * u - d, right, left, u, heavy_hit);
//     lance(ball2, t + 2 * u, 1 * u - d, left, right, u, heavy_hit);
//     lance(ball2, t + 3 * u, 3 * u - d, right, left, u, normal_hit);
//     lance(ball0, t + 3.5 * u, 0.5 * u - d, left, right, u, heavy_hit);
//     // lance(ball0, t + 4 * u, 1.5 * u - d, right, right, u);
//     lance(ball1, t + 5 * u, 2 * u - d, left, right, u, normal_hit);
//     lance(ball0, t + 5.5 * u, 3.5 * u - d, right, right, u, normal_hit);
//     lance(ball2, t + 6 * u, 4 * u - d, left, left, u, normal_hit);
//     lance(ball1, t + 7 * u, 1 * u - d, right, left, u, heavy_hit);
//     const tmp = ball0;
//     ball0 = ball1;
//     ball1 = tmp;
//     ball2 = ball2;
//     t = t + 8 * u;
// }

// for (let i = 0; i < 100; i++) {
//     lance(
//         simulator.balls[i % 3],
//         1 + i * u,
//         3 * u - d,
//         vincent.hands[i % 2],
//         vincent.hands[(i + 1) % 2],
//         u,
//         ["normal_hit1", "normal_hit2"]
//     );
// }

//////////////////////////////////////////////////////////////////////////////
// Edit here
//////////////////////////////////////////////////////////////////////////////
function conv_siteswap_to_pattern(siteswap: string): number[][] {
    const pattern: number[][] = [[], []];
    if (!siteswap.includes("(")) {
        if (siteswap.length % 2 === 1) {
            siteswap = siteswap + siteswap;
        }
        for (let i = 0; i < siteswap.length; i++) {
            pattern[i % 2][i] = parseInt(siteswap.substring(i, i + 1));
            pattern[(i + 1) % 2][i] = 0;
        }
    } else {
        let c = 0;
        //for (let i = 0; i != -1; i = siteswap.indexOf(")", i))

        while (c < siteswap.length) {
            if (siteswap.includes("(", c)) {
                const synchro = siteswap.substring(
                    siteswap.indexOf("(", c) + 1,
                    siteswap.indexOf(")", c)
                );
                for (let i = 0; i < synchro.length; i++) {
                    pattern[i % 2][pattern[i % 2].length] = parseInt(synchro.substring(i, i + 1)); //We add to the last box the throw
                    pattern[i % 2][pattern[i % 2].length] = 0; //We add zero to the last box
                }
                c = siteswap.indexOf(")", c) + 1;
            } else {
                break;
            }
        }
    }
    //console.log(pattern);
    return pattern;
}

function lance_pattern(pattern: number[][], colors: string[], u: number, d: number): void {
    function pre_lancer(pattern: number[][], size: number, held_balls: Ball[]): void {
        /// May be convert to boolean to handle errors
        const thrown_max = Math.max(...pattern.flat());
        function known_all_positions(pier: number[][]): boolean {
            for (let i = 0; i < thrown_max - 1; i++) {
                for (const subArray of pier) {
                    if (!(subArray[i] === 0 || subArray[i] === 1)) {
                        return false;
                    }
                }
            }
            return true;
        }
        //const pier: number[][] = [];
        const pier: number[][] = Array.from(pattern, () => Array<number>(thrown_max));
        // for (const item of pattern) {
        //     pier.push([]); // Ajoutez un nouveau sous-tableau vide
        //}
        while (!known_all_positions(pier)) {
            for (let i = 0; i < size; i++) {
                if (i % pattern.length === 0) {
                    for (let i2 = 0; i2 < pattern.length; i2++) {
                        pier[i2].splice(0, 1);
                        pier[i2][thrown_max - 1] = 0;
                    }
                }
                if (pattern[i % pattern.length][~~(i / pattern.length)] != 0) {
                    pier[
                        ((i % pattern.length) +
                            pattern[i % pattern.length][~~(i / pattern.length)]) %
                            2
                    ][pattern[i % pattern.length][~~(i / pattern.length)] - 1] = 1;
                }
            }
        }
        // Execute pier in time -u
        const spattern: number[][] = [[], []]; // All pier execute at time -u with hand i (spattern[i])
        const totale_size = pier.reduce((total, subArray) => total + subArray.length, 0);

        // Make spattern and execute it
        for (let i = 0; i < totale_size; i++) {
            if (pier[i % pier.length][~~(i / pier.length)] === 1) {
                const last_spattern_position = spattern.flat().length;
                spattern[i % pier.length][last_spattern_position] = ~~(i / pier.length) + 1;
                copyBalls(held_balls[last_spattern_position], held_balls_hand, i, pier.length);
                lance(
                    held_balls[last_spattern_position],
                    -u,
                    u * (~~(i / pier.length) + 1) - d,
                    vincent.hands[i % 2],
                    vincent.hands[i % 2],
                    u
                );
            }
        }
        //console.log(spattern);
    }
    function thrown_from_0(held_balls: Ball[], held_balls_hand: Ball[][][], i: number): void {
        if (held_balls_hand[i % 2][~~(i / pattern.length)] != undefined) {
            for (let i2 = 0; i2 < held_balls_hand[i % 2][~~(i / pattern.length)].length; i2++) {
                let new_position: number;
                if (held_balls_hand[i2 % 2][~~(i / pattern.length) + 1] != undefined) {
                    new_position = held_balls_hand[i2 % 2][~~(i / pattern.length) + 1].length;
                } else {
                    new_position = 0;
                    held_balls_hand[i2 % 2][~~(i / pattern.length) + 1] = [];
                }
                held_balls_hand[i2 % 2][~~(i / pattern.length) + 1][new_position] =
                    held_balls_hand[i2 % 2][~~(i / pattern.length)][i2];
            }
        }
        //Normalement inutile
        // if (held_balls[i] != undefined) {
        //     held_balls.splice(i, 0, undefined);
        //     //console.log(held_balls, i);
        // }
    }
    function copyBalls(ball: Ball, held_balls_hand: Ball[][][], i: number, length: number): void {
        const table: Ball[] = [];
        held_balls_hand[i % 2][~~(i / length)] = table;
        held_balls_hand[i % 2][~~(i / length)][0] = ball;
    }

    // Count the balls needed and check if it is_Parallel
    let n_balls = 0;
    for (const subArray of pattern) {
        n_balls += subArray.reduce((p, c) => p + c, 0) / subArray.length;
    }

    // Build the balls
    for (let i = 0; i < Math.round(n_balls); i++) {
        simulator.balls[i] = new Ball(colors[i], 0.04);
    }

    // Add balls to scene
    simulator.balls.forEach((ball) => {
        scene.add(ball.mesh);
    });

    // Build the sequence of throws
    const total_size = pattern.reduce((total, subArray) => total + subArray.length, 0);
    const N = total_size * 50;
    const held_balls: Ball[] = Array<Ball>(N); // TODO replace to juste balls to take.
    const held_balls_hand: Ball[][][] = [[], []];
    for (let i = 0; i < simulator.balls.length; i++) {
        held_balls[i] = simulator.balls[i];
    }

    pre_lancer(pattern, total_size, held_balls);
    main(N, held_balls, held_balls_hand, pattern);
    function main(N: number, held_balls: Ball[], held_balls_hand: Ball[][][], pattern: number[][]) {
        for (let i = 0; i < N - total_size; i++) {
            //const h = pattern.flat()[i % total_size];
            const h =
                pattern[i % pattern.length][
                    ~~(i / pattern.length) % pattern[i % pattern.length].length
                ]; //[select each table one by one][select each i frome 0 to pattern[subarray].length, this for each subarray]
            if (h === 0) {
                thrown_from_0(held_balls, held_balls_hand, i);
            } else {
                console.assert(held_balls_hand[i % 2][~~(i / pattern.length)] != undefined);
                // if (held_balls_hand[i % 2][~~(i / pattern.length)] == undefined) {
                //     //Impossible, but juste for verify
                //     if (held_balls[i] != undefined) {
                //         copyBalls(held_balls[i], held_balls_hand, i, pattern.length);
                //     } else {
                //         console.log(
                //             "held_balls_hand[",
                //             i % 2,
                //             "][",
                //             ~~(i / pattern.length),
                //             "] et held_balls[",
                //             i,
                //             "] sont undefined.",
                //             held_balls,
                //             held_balls_hand
                //         );
                //         //     deleteEmptyBox([], held_balls_hand, i, pattern.length);
                //         //     //held_balls_hand[i % 2].splice(~~(i / pattern.length), 1);
                //     }
                // }
                if (held_balls_hand[(i + h) % 2][~~(i / pattern.length) + h] == undefined) {
                    held_balls_hand[(i + h) % 2][~~(i / pattern.length) + h] = [];
                }
                held_balls_hand[(i + h) % 2][~~(i / pattern.length) + h][
                    held_balls_hand[(i + h) % 2][~~(i / pattern.length) + h].length
                ] = held_balls[i] = held_balls_hand[i % 2][~~(i / pattern.length)][0];
                //held_balls[i] = held_balls_hand[i % 2][~~(i / pattern.length)][0];
                if (held_balls_hand[i % 2][~~(i / pattern.length)].length > 1) {
                    if (held_balls_hand[i % 2][~~(i / pattern.length) + 1] != undefined) {
                        held_balls_hand[i % 2][~~(i / pattern.length) + 1] = [
                            ...held_balls_hand[i % 2][~~(i / pattern.length)].slice(1),
                            ...held_balls_hand[i % 2][~~(i / pattern.length) + 1]
                        ];
                    } else {
                        held_balls_hand[i % 2][~~(i / pattern.length) + 1] = [];
                        held_balls_hand[i % 2][~~(i / pattern.length) + 1] = [
                            ...held_balls_hand[i % 2][~~(i / pattern.length)].slice(1)
                        ];
                    }
                }
                const time: number = ~~(i / pattern.length) * u;
                const flight_time: number = h * u - d;
                lance(
                    held_balls[i],
                    time, //~~(i / pattern.length) * u,
                    flight_time, //h * u - d,
                    vincent.hands[i % 2],
                    vincent.hands[(i + h) % 2],
                    u
                );
            }
        }

        console.log(held_balls_hand);
    }

    simulator.balls = simulator.balls.filter((ball) => {
        return ball.timeline.length !== 0;
    });
}

// Configuration
const colors = ["red", "green", "blue", "purple", "yellow", "orange", "pink"];
const u2 = 0.25;
const d2 = u2 / 2;

//Construiction pour tweakpane /////////////////////////////////////////
const tweakpane_container = document.querySelector(".tp-dfwv");
if (!(tweakpane_container instanceof HTMLElement)) {
    throw new Error();
}
const pane = new TWEAKPANE.Pane({ container: tweakpane_container });
////////////////////////////////////////////////////////////////////////

//Default value of siteswap in siteswap_blade
const PARAMS = {
    Siteswap: "(66)(20)(40)"
};
//TODO: Handle pattern errors
//Build siteswap_blade and check change
const siteswap_blade = pane.addBinding(PARAMS, "Siteswap");
siteswap_blade.on("change", (ev) => {
    if (ev.value != "") {
        simulator.reset_pattern();
        lance_pattern(conv_siteswap_to_pattern(ev.value), colors, u2, d2);
    }
});

const visitor = new MyVisitor<pier[]>();
const result = visitor.visit(tree);

console.log(result);

// Pattern

//Const pattern with default value
const pattern = conv_siteswap_to_pattern(PARAMS.Siteswap);

//const pattern = [[5]];
//const pattern = [[3, 0, 3]];
//const pattern = [
//     [4, 4, 0, 0],
//     [4, 0, 0, 0]
// ];
//const pattern = [
//     [6, 0, 0, 0, 1, 4], //Each sub-array represents a line of action, each index happens at the same time
//     [6, 0, 0, 0, 1, 4]
// ];

lance_pattern(pattern, colors, u2, d2);

//////////////////////////////////////////////////////////////////////////////
// End edit here
//////////////////////////////////////////////////////////////////////////////

// const u = 0.25;
// const d = u / 2;
// for (let i = 0; i < 100; i++) {
//     lance(
//         simulator.balls[i % 3],
//         1 + i * u,
//         3 * u - d,
//         vincent.hands[i % 2],
//         vincent.hands[(i + 1) % 2],
//         u,
//         ["normal_hit1", "normal_hit2"]
//     );
// }

// lance(ball1, 1 + 1*u, 3 * u - d, left_hand, right_hand, u);
// lance(ball2, 1 + 2*u, 3 * u - d, right_hand, left_hand, u);
// lance(ball0, 1 + 3*u, 3 * u - d, left_hand, right_hand, u);
// lance(ball1, 1 + 4*u, 3 * u - d, right_hand, left_hand, u);
// lance(ball2, 1 + 5*u, 3 * u - d, left_hand, right_hand, u);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);

//  To ~ Ligne 212
// const tweakpane_container = document.querySelector(".tp-dfwv");
// if (!(tweakpane_container instanceof HTMLElement)) {
//     throw new Error();
// }
// const pane = new TWEAKPANE.Pane({ container: tweakpane_container });

pane.registerPlugin(EssentialsPlugin);
const fpsGraph = pane.addBlade({
    view: "fpsgraph",
    label: "FPS",
    rows: 2
}) as EssentialsPlugin.FpsGraphBladeApi;
const monitor = {
    video_time: 0,
    audio_time: 0,
    audio_control: 0,
    playback_rate: 1,
    transport_play: transport.state === "started",
    music: music
};
pane.addBinding(monitor, "video_time", {
    readonly: true
});
pane.addBinding(monitor, "audio_time", {
    readonly: true
});
const blade = pane.addBinding(monitor, "audio_time", {
    min: 0,
    max: 100,
    step: 0.1
});
blade.on("change", (ev) => {
    if (ev.last) {
        music.currentTime = ev.value;
        if (monitor.transport_play && music.paused) {
            music.play().catch(() => {
                throw new Error("Problem");
            });
        }
    }
});

const blade_playback_rate = pane.addBinding(monitor, "playback_rate", {
    min: 0.5,
    max: 2,
    step: 0.1
});
blade_playback_rate.on("change", (ev) => {
    if (ev.last) {
        music.playbackRate = ev.value;
    }
});
const play_blade = pane.addBinding(monitor, "transport_play", { label: "Play" });
play_blade.on("change", async (ev) => {
    if (!ev.value) {
        // transport.pause();
        music.pause();
    } else {
        if (Tone.getContext().state === "suspended") {
            await Tone.start();
        }
        await Tone.loaded();
        await music.play();
    }
});

function render(t: number) {
    fpsGraph.begin();
    const time = t * 0.001; // convert time to seconds
    const audio_time = music.currentTime;
    monitor.video_time = time;
    monitor.audio_time = audio_time;

    resizeRendererToDisplaySize(renderer, camera);

    simulator.balls.forEach((ball) => {
        ball.render(audio_time);
        if (!music.paused) {
            ball.play_on_catch(audio_time);
        }
    });
    simulator.jugglers.forEach((juggler) => {
        juggler.render(audio_time);
    });

    const listener = Tone.getListener();
    const camera_pos = camera.localToWorld(new THREE.Vector3(0, 0, 0));
    listener.positionX.value = camera_pos.x;
    listener.positionY.value = camera_pos.y;
    listener.positionZ.value = camera_pos.z;
    const camera_dir = camera.localToWorld(new THREE.Vector3(0, 0, -1)).sub(camera_pos);
    listener.forwardX.value = camera_dir.x;
    listener.forwardY.value = camera_dir.y;
    listener.forwardZ.value = camera_dir.z;
    const camera_up = camera.localToWorld(camera.up.clone()).sub(camera_pos);
    listener.upX.value = camera_up.x;
    listener.upY.value = camera_up.y;
    listener.upZ.value = camera_up.z;

    renderer.render(scene, camera);

    fpsGraph.end();
    requestAnimationFrame(render);
}

simulator.jugglers.forEach((juggler) => {
    scene.add(juggler.mesh);
});
simulator.balls = simulator.balls.filter((ball) => {
    return ball.timeline.length !== 0;
});
simulator.balls.forEach((ball) => {
    scene.add(ball.mesh);
});

requestAnimationFrame(render);
