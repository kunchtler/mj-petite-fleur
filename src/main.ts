/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as THREE from "three";
import { resizeRendererToDisplaySize, Simulator } from "./Simulator";
import { Ball } from "./Ball";
import { Juggler } from "./Juggler";
import * as TWEAKPANE from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import * as Tone from "tone";
// import { lance } from "./Interactive_siteswap_player";
import { MediaPlayer, TimeConductor } from "./AudioPlayer";
import { Hand } from "./Hand";
import { ThrowEvent, CatchEvent, HandMultiEvent, TablePutEvent } from "./Timeline";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Table } from "./Table";
import { string } from "three/examples/jsm/nodes/Nodes.js";

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
//TODO : Fixer le décalage musique / image quand on utilise le slider temporel (demanderait de passer par web audio api avec controle manuel du temps ?) ou alors juste en étandant Player de Tonejs ?
//TODO : Dans petite fleur, tester le u plus petit dans les fonctions.
//TODO : Remake system to sync with tonejs transport ? (to allow for smooth bpm transitions for instance)
//TODO : Change sfx playbackrate based on music playbackrate.
//TODO : For fun, squash and stretch on the ball + Failevent

//TODO : Controles fonctionnent bien sur firefox, à voire sur chrome et tel.
//TODO : Make sfx sounds pause when simulator pauses.
//TODO : undefined or null ?
//TODO : Chrom + Windows : debugger not on render freezes app ?

/// URL Parameters (temp) ///
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let mute_simulator = false;
if (urlParams.has("mute-simulator")) {
    mute_simulator = urlParams.get("mute-simulator") === "1";
}
let mute_video = true;
if (urlParams.has("mute-video")) {
    mute_video = urlParams.get("mute-video") === "1";
}

const play_pause_button = document.getElementById("play_button");
const seek_bar = document.getElementById("time_slider");
const play_icon = document.getElementById("play_icon");

if (
    !(
        play_pause_button instanceof HTMLButtonElement &&
        seek_bar instanceof HTMLInputElement &&
        play_icon instanceof HTMLImageElement
    )
) {
    throw Error("Couldn't grab all references from js.");
}

seek_bar.value = "0";
seek_bar.max = "5";

const time_conductor = new TimeConductor({});

let had_ended = false;

play_pause_button.addEventListener("click", async () => {
    if (had_ended) {
        time_conductor.currentTime = 0;
    }
    if (time_conductor.playing) {
        time_conductor.pause();
    } else {
        if (Tone.getContext().state === "suspended") {
            await Tone.start();
        }
        await time_conductor.play();
    }
});

time_conductor._event_target.addEventListener("play", () => {
    had_ended = false;
    play_icon.src = "icons/pause.svg";
});

time_conductor._event_target.addEventListener("pause", () => {
    had_ended = false;
    play_icon.src = "icons/play.svg";
});

// video_html_elem.addEventListener("ended", () => {
//     had_ended = true;
//     play_icon.src = "icons/loop.svg";
// });

time_conductor._event_target.addEventListener("timeupdate", () => {
    const duration = parseInt(seek_bar.max);
    const current_time = time_conductor.currentTime;
    seek_bar.value = (current_time < duration ? current_time : duration).toString();
});

let resume_on_click: boolean | undefined = undefined;

seek_bar.addEventListener("click", async () => {
    if (resume_on_click) {
        await time_conductor.play();
    }
    resume_on_click = undefined;
});

seek_bar.addEventListener("input", () => {
    if (resume_on_click === undefined) {
        resume_on_click = time_conductor.playing || play_icon.src === "icons/loop.svg";
        if (time_conductor.playing) {
            time_conductor.pause();
        }
    }
});

seek_bar.addEventListener("change", async () => {
    time_conductor.currentTime = parseFloat(seek_bar.value);
    if (had_ended) {
        await time_conductor.play();
    }
});

const transport = Tone.getTransport();
// const transport = new TransportPlayback();
// const context = Tone.getContext();

const handle_load_end = (() => {
    let load_ready = 0;
    return () => {
        load_ready++;
        console.log(`Load count : ${load_ready}/2`);
        if (load_ready >= 2) {
            const wait_screen = document.querySelector("#wait_screen");
            if (!(wait_screen instanceof Element)) {
                throw new Error();
            }
            wait_screen.classList.add("fade_out");
            console.log("fade start");
            wait_screen.addEventListener("animationend", async () => {
                console.log("fade end");
                wait_screen.remove();
                // video.currentTime = 69;
                await time_conductor.play();
            });
        }
    };
})();

// Handling of the first user input before playing audio.
const first_interaction_event_types = ["mousedown", "keydown", "touchstart"];

async function handle_first_interaction(event: Event) {
    await Tone.start();
    for (const event_type of first_interaction_event_types) {
        event.currentTarget?.removeEventListener(event_type, handle_first_interaction, true);
    }
    const text_element = document.querySelector("#wait_user");
    if (!(text_element instanceof HTMLParagraphElement)) {
        console.log("oups");
        // throw new Error();
    } else {
        text_element.textContent = "User interaction detected ✔️";
        console.log("Touch ok");
        handle_load_end();
    }
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
    console.log("sound ok");
    handle_load_end();
}

const sfx_buffers = new Map<string, Tone.ToneAudioBuffer>([
    ["do", new Tone.ToneAudioBuffer("notes/C4.mp3")],
    ["re", new Tone.ToneAudioBuffer("notes/D4.mp3")],
    ["mi", new Tone.ToneAudioBuffer("notes/E4.mp3")],
    ["fa", new Tone.ToneAudioBuffer("notes/F4.mp3")],
    ["sol", new Tone.ToneAudioBuffer("notes/G4.mp3")],
    ["la", new Tone.ToneAudioBuffer("notes/A4.mp3")],
    ["si", new Tone.ToneAudioBuffer("notes/B4.mp3")],
    ["do2", new Tone.ToneAudioBuffer("notes/C5.mp3")]
]);

const sfx_gain = new Tone.Gain(mute_simulator ? 0 : 1).toDestination();
// sfx_gain.gain.value = 0;

await handle_sounds_loaded();

const simulator = new Simulator("#simulator_canvas");
const scene = simulator.scene;
const renderer = simulator.renderer;
const camera = simulator.camera;

//create_juggler_mesh(scene, 2.0, 0.5, 0.3);

simulator.jugglers = [new Juggler(2.0)];
// vincent.mesh.position.set(-1, 0, 1);
// vincent.mesh.rotateY(Math.PI / 2);

//TODO : Handle properly this await (by loading the sounds for the balls only when Tone has loaded the buffer.)
await Tone.loaded();
for (const [color, note] of [
    ["red", "do"],
    ["green", "re"],
    ["blue", "mi"]
]) {
    const player = new Tone.Player(sfx_buffers.get(note));
    const panner = new Tone.Panner3D({ panningModel: "HRTF", rolloffFactor: 1 });
    player.connect(panner);
    panner.connect(sfx_gain);
    simulator.balls.push(
        new Ball({
            color: color,
            radius: 0.08,
            name: undefined,
            sound: player,
            panner3D: panner,
            timeline: undefined
        })
    );
}

const bdo = simulator.balls[0];
const bre = simulator.balls[1];
const bmi = simulator.balls[2];

const vincent = simulator.jugglers[0];
//TODO : One note per ball

// const tweakpane_container = document.querySelector(".tp-dfwv");
// if (!(tweakpane_container instanceof HTMLElement)) {
//     throw new Error();
// }
// const pane = new TWEAKPANE.Pane({ container: tweakpane_container });

// function swap<T>(list: T[], order?: number[]): void {
//     if (list.length === 0) {
//         return;
//     }
//     if (order === undefined) {
//         order = [];
//         for (let i = 0; i < list.length; i++) {
//             order.push((i + 1) % list.length);
//         }
//     }
//     const list2: T[] = [];
//     for (let i = 0; i < list.length; i++) {
//         list2.push(list[order[i]]);
//     }
//     for (let i = 0; i < list.length; i++) {
//         list[i] = list2[i];
//     }
// }

// function lance(
//     ball: Ball,
//     throw_time: number,
//     ss_height: number,
//     source: Hand,
//     target: Hand,
//     unit_time: number,
//     sound?: string[] | string
// ): void {
//     const dwell_time = ss_height <= 1 ? unit_time / 3 : (unit_time * 9) / 10;
//     const ev1 = new JugglingEvent(throw_time + dwell_time, unit_time, "THROW", source, ball);
//     const ev2 = new JugglingEvent(
//         throw_time + ss_height * unit_time,
//         unit_time,
//         "CATCH",
//         target,
//         ball,
//         sound
//     );
//     ev1.pair_with(ev2);
//     ball.timeline = ball.timeline.insert(ev1.time, ev1);
//     ball.timeline = ball.timeline.insert(ev2.time, ev2);
//     source.timeline = source.timeline.insert(ev1.time, ev1);
//     target.timeline = target.timeline.insert(ev2.time, ev2);
// }

function lance(
    ball: Ball,
    throw_time: number,
    ss_height: number,
    source: Hand,
    target: Hand,
    unit_time: number,
    sound?: string[] | string
): void {
    const time_offset = ss_height <= 1 ? unit_time / 3 : (unit_time * 9) / 10;
    const ev1 = new ThrowEvent({
        time: throw_time + time_offset,
        unit_time: unit_time,
        sound_name: null,
        ball: ball,
        hand: source
    });
    const ev2 = new CatchEvent({
        time: throw_time + ss_height * unit_time,
        unit_time: unit_time,
        sound_name: "", //TODO : Fix sound handling, this is dirty. Have events play sound. Have hands not have this attribute.
        ball: ball,
        hand: target
    });
    console.log(ev1);
    console.log(ev2);
    ball.timeline.setElement(ev1.time, ev1);
    ball.timeline.setElement(ev2.time, ev2);
    const source_it = source.timeline.find(ev1.time);
    if (source_it.isAccessible() && source_it.pointer[1] instanceof HandMultiEvent) {
        source_it.pointer[1].events.push(ev1);
    } else {
        const source_ev = new HandMultiEvent<CatchEvent | ThrowEvent>({
            time: ev1.time,
            unit_time: ev1.unit_time,
            hand: ev1.hand,
            events: [ev1]
        });
        source.timeline.setElement(source_ev.time, source_ev);
    }
    const target_it = target.timeline.find(ev1.time);
    if (target_it.isAccessible() && target_it.pointer[1] instanceof HandMultiEvent) {
        target_it.pointer[1].events.push(ev1);
    } else {
        const target_ev = new HandMultiEvent<CatchEvent | ThrowEvent>({
            time: ev2.time,
            unit_time: ev2.unit_time,
            hand: ev2.hand,
            events: [ev2]
        });
        target.timeline.setElement(target_ev.time, target_ev);
    }
}

//TODO : Forbid in timeline a ball to "teleport from hand to hand" ?
//TODO : Instead of having rest depend unit time, make it depend on some constant (time independent from unit_time)
//TODO : timeline.add_event(event) so as not to pass event.time ?
//TODO : Function to add things to the timeline and handle collision ?
function put_on_table(ball: Ball, time: number, hand: Hand, table: Table, unit_time: number): void {
    const time_offset = unit_time / 3; //TODO : Pb if next event too close :/
    const ev = new TablePutEvent({
        time: time + time_offset,
        unit_time: unit_time,
        ball: ball,
        hand: hand,
        table: table
    });
    ball.timeline.setElement(ev.time, ev);
    hand.timeline.setElement(ev.time, ev);
}

const u = 0.25;
const t = 0;

const balls_placement: Record<string, THREE.Vector2> = {
    do: new THREE.Vector2(1, 0.5),
    doD: new THREE.Vector2(1.5, 1.5),
    re: new THREE.Vector2(2, 0.5),
    reD: new THREE.Vector2(2.5, 1.5),
    mi: new THREE.Vector2(3, 0.5),
    fa: new THREE.Vector2(4, 0.5),
    faD: new THREE.Vector2(4.5, 1.5),
    sol: new THREE.Vector2(5, 0.5),
    solD: new THREE.Vector2(7.5, 1.5),
    la: new THREE.Vector2(6, 0.5),
    laD: new THREE.Vector2(6.5, 1.5),
    si: new THREE.Vector2(7, 0.5),
    do2: new THREE.Vector2(8, 0.5)
};

const table = new Table({
    height: 1,
    surface_real_dimensions: [1.1, 0.5],
    surface_internal_dimensions: [9, 2],
    balls_placement: balls_placement
});
table.mesh.position.set(0.9, 0, 0);
scene.add(table.mesh);

const right_hand = vincent.right_hand;
const left_hand = vincent.left_hand;

lance(bdo, t + 0 * u, 3, vincent.left_hand, vincent.right_hand, u);
lance(bre, t + 1 * u, 3, vincent.right_hand, vincent.left_hand, u);
lance(bmi, t + 2 * u, 3, vincent.left_hand, vincent.right_hand, u);
put_on_table(bdo, t + 5 * u, vincent.right_hand, table, u);
lance(bre, t + 9 * u, 3, vincent.left_hand, vincent.right_hand, u);
//TODO : Change the fact that we need more time to put balls on the table than to throw it
//So adapt the time where we go at rest position.
//lance(bdo, t + 3 * u, 3, vincent.right_hand, table, u);

//TODO : Shorten notes or Synthesize with Tone ?

//////////////// Editeur de patterns ////////////////

// // Configuration
// const colors = ["red", "green", "blue", "purple", "yellow", "orange", "pink"];
// const u2 = 0.25;
// const d2 = u2 / 2;
// //Default value of siteswap in siteswap_blade
// const PARAMS = {
//     Siteswap: "(66)(20)(40)"
// };
// //TODO: Handle pattern errors
// //Build siteswap_blade and check change
// const siteswap_blade = pane.addBinding(PARAMS, "Siteswap");
// siteswap_blade.on("change", (ev) => {
//     if (ev.value != "") {
//         simulator.reset_pattern();
//         lance_pattern(conv_siteswap_to_pattern(ev.value), colors, u2, d2, vincent, simulator);
//     }
// });

// const visitor = new MyVisitor<pier[]>();
// const result = visitor.visit(tree);
// console.log(result);
// //Pattern
// //Const pattern with default value
// const pattern = conv_siteswap_to_pattern(PARAMS.Siteswap);
// lance_pattern(pattern, colors, u2, d2, vincent, simulator);

//////////////// Editeur de patterns ////////////////

// const u = 0.25;
// const d = u / 2;
// for (let i = 0; i < 100; i++) {
//     lance(
//         simulator.balls[i % 3],
//         1 + i * u,
//         3 ,
//         vincent.hands[i % 2],
//         vincent.hands[(i + 1) % 2],
//         u,
//         ["normal_hit1", "normal_hit2"]
//     );
// }

// lance(ball1, 1 + 1*u, 3 , left_hand, right_hand, u);
// lance(ball2, 1 + 2*u, 3 , right_hand, left_hand, u);
// lance(ball0, 1 + 3*u, 3 , left_hand, right_hand, u);
// lance(ball1, 1 + 4*u, 3 , right_hand, left_hand, u);
// lance(ball2, 1 + 5*u, 3 , left_hand, right_hand, u);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);
// lance(ball0, 1, 1, right_hand, left_hand, 0.5);

// pane.registerPlugin(EssentialsPlugin);
// const fpsGraph = pane.addBlade({
//     view: "fpsgraph",
//     label: "FPS",
//     rows: 2
// }) as EssentialsPlugin.FpsGraphBladeApi;
const monitor = {
    video_time: 0,
    audio_time: 0,
    audio_control: 0,
    playback_rate: 1,
    transport_play: transport.state === "started",
    music: time_conductor,
    // mute_music: music_gain.gain.value === 0,
    mute_sfx: sfx_gain.gain.value === 0
};
// pane.addBinding(monitor, "video_time", {
//     readonly: true
// });
// pane.addBinding(monitor, "audio_time", {
//     readonly: true
// });
// const blade = pane.addBinding(monitor, "audio_time", {
//     min: 0,
//     max: 100,
//     step: 0.1
// });
// blade.on("change", (ev) => {
//     if (ev.last) {
//         video.currentTime = ev.value;
//         if (monitor.transport_play && video.paused) {
//             video.play().catch(() => {
//                 throw new Error("Problem");
//             });
//         }
//     }
// });

// const blade_playback_rate = pane.addBinding(monitor, "playback_rate", {
//     min: 0.5,
//     max: 2,
//     step: 0.1
// });
// blade_playback_rate.on("change", (ev) => {
//     if (ev.last) {
//         video.playbackRate = ev.value;
//     }
// });
// const play_blade = pane.addBinding(monitor, "transport_play", { label: "Play" });
// play_blade.on("change", async (ev) => {
//     if (!ev.value) {
//         // transport.pause();
//         video.pause();
//     } else {
//         if (Tone.getContext().state === "suspended") {
//             await Tone.start();
//         }
//         await Tone.loaded();
//         await video.play();
//     }
// });
// const mute_music = pane.addBinding(monitor, "mute_music", { label: "Mute Music" });
// mute_music.on("change", (ev) => {
//     music_gain.gain.value = ev.value ? 0 : 3;
// });
// const mute_sfx = pane.addBinding(monitor, "mute_sfx", { label: "Mute Sounds" });
// mute_sfx.on("change", (ev) => {
//     sfx_gain.gain.value = ev.value ? 0 : 2;
// });

// const init_tan_fov = Math.tan(((Math.PI / 180) * camera.fov) / 2);
// const init_window_height = window.innerHeight;
// THREE.ColorManagement.enabled = true;

// Bowling Pin Model

// const loader = new GLTFLoader();
// loader.load(
//     "bowling_pin.glb",
//     function (gltf) {
//         const pin = new THREE.Object3D();
//         scene.add(pin);
//         pin.add(gltf.scene);
//         gltf.scene.scale.multiplyScalar(5);
//         // @ts-ignore
//         const pin_color = // @ts-ignore
//             gltf.scene.children[0].children[0].children[0].children[0].children[0].material.color;
//         // @ts-ignore
//         gltf.scene.children[0].children[0].children[0].children[0].children[1].material.color =
//             pin_color;
//         pin.position.set(0.1, 0.3, 0);
//         const circleGeometry = new THREE.CircleGeometry(0.35, 64);
//         const textureLoader = new THREE.TextureLoader();
//         const texture = textureLoader.load("leo.jpg");
//         texture.colorSpace = THREE.SRGBColorSpace;
//         const circleMaterial = new THREE.MeshBasicMaterial({
//             // color: 0xffffff,
//             map: texture,
//             // transparent: true,
//             // toneMapped: false,
//             side: THREE.DoubleSide
//         }); // white color
//         const circle = new THREE.Mesh(circleGeometry, circleMaterial);
//         pin.add(circle);
//         circle.rotateY(Math.PI / 2);
//         circle.position.set(0.17, 1.55, 0);

//         // Create a black outline
//         const edgeGeometry = new THREE.EdgesGeometry(circleGeometry);
//         const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // black color
//         const outline = new THREE.LineLoop(edgeGeometry, edgeMaterial);
//         circle.add(outline); // Add outline as a child of the circle
//     },
//     undefined,
//     function (error) {
//         console.error(error);
//     }
// );

function render(t: number) {
    const time = t * 0.001; // convert time to seconds
    // console.log(vincent.mesh.position);
    // fpsGraph.begin();
    const video_time = time_conductor.currentTime;
    // monitor.video_time = time;
    // monitor.audio_time = video_time;

    resizeRendererToDisplaySize(renderer, camera /*, init_tan_fov, init_window_height*/);

    simulator.balls.forEach((ball) => {
        ball.render(video_time);
        if (!time_conductor.paused) {
            ball.play_on_catch(video_time);
        }
    });
    simulator.jugglers.forEach((juggler) => {
        juggler.render(video_time);
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

    // fpsGraph.end();
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
resizeRendererToDisplaySize(renderer, camera /*, init_tan_fov, init_window_height*/);
requestAnimationFrame(render);
