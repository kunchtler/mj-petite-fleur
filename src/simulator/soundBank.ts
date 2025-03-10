//TODO : AudioBuffer or AudioBufferSourceNode ?
//TODO : Change sounds so they are shorter + lighter format.

// export class SoundBank {
//     cachedBuffers: Map<string, AudioBuffer>;

//     constructor(cachedBuffers?: Map<string, AudioBuffer>) {
//         this.cachedBuffers = cachedBuffers ?? new Map<string, AudioBuffer>();
//     }

//     setSound(name: string, sound: AudioBuffer): void {
//         this.cachedBuffers.set(name, sound);
//     }

//     getSound(name: string): AudioBuffer | undefined {
//         return this.cachedBuffers.get(name)!;
//     }

//     eraseCache(): void {
//         this.cachedBuffers.clear();
//     }
// }

export async function getNoteBuffer(
    note: string,
    audioContext: AudioContext
): Promise<AudioBuffer | undefined> {
    if (!validNoteNames.has(note)) {
        console.error(`Name ${note} is not a valid known note name.`);
        return undefined;
    }
    try {
        const response = await fetch(`notes/${validNoteNames.get(note)!}.mp3`);
        return await audioContext.decodeAudioData(await response.arrayBuffer());
    } catch (err) {
        console.error(`Unable to fetch the audio file. Error: ${err}`);
        return undefined;
    }
}

export const validNoteNames = new Map<string, string>([
    ["A0", "A0"],
    ["A#0", "A#0"],
    ["Bb0", "A#0"],
    ["B0", "B0"],

    ["C1", "C1"],
    ["C#1", "C#1"],
    ["Db1", "C#1"],
    ["D1", "D1"],
    ["D#1", "D#1"],
    ["Eb1", "D#1"],
    ["E1", "E1"],
    ["F1", "F1"],
    ["F#1", "F#1"],
    ["Gb1", "F#1"],
    ["G1", "G1"],
    ["G#1", "G#1"],
    ["Ab1", "G#1"],
    ["A1", "A1"],
    ["A#1", "A#1"],
    ["Bb1", "A#1"],
    ["B1", "B1"],

    ["C2", "C2"],
    ["C#2", "C#2"],
    ["Db2", "C#2"],
    ["D2", "D2"],
    ["D#2", "D#2"],
    ["Eb2", "D#2"],
    ["E2", "E2"],
    ["F2", "F2"],
    ["F#2", "F#2"],
    ["Gb2", "F#2"],
    ["G2", "G2"],
    ["G#2", "G#2"],
    ["Ab2", "G#2"],
    ["A2", "A2"],
    ["A#2", "A#2"],
    ["Bb2", "A#2"],
    ["B2", "B2"],

    ["C3", "C3"],
    ["C#3", "C#3"],
    ["Db3", "C#3"],
    ["D3", "D3"],
    ["D#3", "D#3"],
    ["Eb3", "D#3"],
    ["E3", "E3"],
    ["F3", "F3"],
    ["F#3", "F#3"],
    ["Gb3", "F#3"],
    ["G3", "G3"],
    ["G#3", "G#3"],
    ["Ab3", "G#3"],
    ["A3", "A3"],
    ["A#3", "A#3"],
    ["Bb3", "A#3"],
    ["B3", "B3"],

    ["C4", "C4"],
    ["C#4", "C#4"],
    ["Db4", "C#4"],
    ["D4", "D4"],
    ["D#4", "D#4"],
    ["Eb4", "D#4"],
    ["E4", "E4"],
    ["F4", "F4"],
    ["F#4", "F#4"],
    ["Gb4", "F#4"],
    ["G4", "G4"],
    ["G#4", "G#4"],
    ["Ab4", "G#4"],
    ["A4", "A4"],
    ["A#4", "A#4"],
    ["Bb4", "A#4"],
    ["B4", "B4"],

    ["C5", "C5"],
    ["C#5", "C#5"],
    ["Db5", "C#5"],
    ["D5", "D5"],
    ["D#5", "D#5"],
    ["Eb5", "D#5"],
    ["E5", "E5"],
    ["F5", "F5"],
    ["F#5", "F#5"],
    ["Gb5", "F#5"],
    ["G5", "G5"],
    ["G#5", "G#5"],
    ["Ab5", "G#5"],
    ["A5", "A5"],
    ["A#5", "A#5"],
    ["Bb5", "A#5"],
    ["B5", "B5"],

    ["C6", "C6"],
    ["C#6", "C#6"],
    ["Db6", "C#6"],
    ["D6", "D6"],
    ["D#6", "D#6"],
    ["Eb6", "D#6"],
    ["E6", "E6"],
    ["F6", "F6"],
    ["F#6", "F#6"],
    ["Gb6", "F#6"],
    ["G6", "G6"],
    ["G#6", "G#6"],
    ["Ab6", "G#6"],
    ["A6", "A6"],
    ["A#6", "A#6"],
    ["Bb6", "A#6"],
    ["B6", "B6"],

    ["C7", "C7"],
    ["C#7", "C#7"],
    ["Db7", "C#7"],
    ["D7", "D7"],
    ["D#7", "D#7"],
    ["Eb7", "D#7"],
    ["E7", "E7"],
    ["F7", "F7"],
    ["F#7", "F#7"],
    ["Gb7", "F#7"],
    ["G7", "G7"],
    ["G#7", "G#7"],
    ["Ab7", "G#7"],
    ["A7", "A7"],
    ["A#7", "A#7"],
    ["Bb7", "A#7"],
    ["B7", "B7"]
]);
