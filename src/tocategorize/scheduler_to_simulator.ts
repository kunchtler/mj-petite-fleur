import { Juggler, JugglerParamConstructor } from "../simulator/Juggler";
import { Simulator } from "../simulator/Simulator";
import {
    BallsInHands,
    FracSortedList,
    SchedulerEvent,
    SimulatorEvent,
    SimulatorToss
} from "./mj_parser";

export type SimulateParams = {
    ballIDSounds: Map<string, string>;
    simulationStart: number;
    simultationEnd: number;
    simulator: Simulator;
    jugglers: Map<
        string,
        {
            events: [number, { hand?: BallsInHands; tosses?: SimulatorToss<number>[] }];
            balls: string[];
            modelParams?: JugglerParamConstructor;
        }
    >;
};

//TODO : In simulator + Juggler + Ball class, make things with maps to be able to call specific jugglers / tables / balls instead of accesing via idx ?

function simulate({
    jugglers,
    ballIDSounds,
    simulationStart,
    simultationEnd,
    simulator
}: SimulateParams): Promise<void> {
    // Reset the simulator. TODO : Should be done by the person calling the func ?
    simulator.reset();

    // Add the jugglers to the simulator.
    for (const [name, { events, balls, modelParams }] of jugglers) {
        const juggler = new Juggler(modelParams);
        // simulator.jugglers
    }

    // Preload the balls sounds.

    // Add the balls to the simulator

    //
}

function schedulerToSimulatorParams(events: SchedulerEvent, tosses: SimulatorToss[]) {}

function simulateToss();

function simulateHandChanges();

function beatToRealTime();

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
    const time_offset = ss_height <= 1 ? unit_time / 3 : (unit_time * 7) / 10;
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
            unit_time: ev1.unitTime,
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
            unit_time: ev2.unitTime,
            hand: ev2.hand,
            events: [ev2]
        });
        target.timeline.setElement(target_ev.time, target_ev);
    }
}

function lance_rev(
    ball: Ball,
    catch_time: number,
    ss_height: number,
    source: Hand,
    target: Hand,
    unit_time: number,
    sound?: string[] | string
): void {
    const time_offset = ss_height <= 1 ? unit_time / 3 : (unit_time * 7) / 10;
    const ev1 = new ThrowEvent({
        time: catch_time - ss_height * unit_time + time_offset,
        unit_time: unit_time,
        sound_name: null,
        ball: ball,
        hand: source
    });
    const ev2 = new CatchEvent({
        time: catch_time,
        unit_time: unit_time,
        sound_name: "", //TODO : Fix sound handling, this is dirty. Have events play sound. Have hands not have this attribute.
        ball: ball,
        hand: target
    });
    // console.log(ev1);
    // console.log(ev2);
    ball.timeline.setElement(ev1.time, ev1);
    ball.timeline.setElement(ev2.time, ev2);
    const source_it = source.timeline.find(ev1.time);
    if (source_it.isAccessible() && source_it.pointer[1] instanceof HandMultiEvent) {
        console.log("1");
        source_it.pointer[1].events.push(ev1);
    } else {
        console.log("2");
        const source_ev = new HandMultiEvent<CatchEvent | ThrowEvent>({
            time: ev1.time,
            unit_time: ev1.unitTime,
            hand: ev1.hand,
            events: [ev1]
        });
        source.timeline.setElement(source_ev.time, source_ev);
    }
    const target_it = target.timeline.find(ev2.time);
    if (target_it.isAccessible() && target_it.pointer[1] instanceof HandMultiEvent) {
        target_it.pointer[1].events.push(ev2);
    } else {
        const target_ev = new HandMultiEvent<CatchEvent | ThrowEvent>({
            time: ev2.time,
            unit_time: ev2.unitTime,
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
function take_from_table(
    ball: Ball,
    time: number,
    hand: Hand,
    table: Table,
    unit_time: number
): void {
    const time_offset = unit_time / 3; //TODO : Pb if next event too close :/
    const ev = new TableTakeEvent({
        time: time + time_offset,
        unit_time: unit_time,
        ball: ball,
        hand: hand,
        table: table
    });
    ball.timeline.setElement(ev.time, ev);
    hand.timeline.setElement(ev.time, ev);
}
