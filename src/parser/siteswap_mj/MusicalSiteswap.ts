import { ParseTreeWalker } from "antlr4";
import MJSiteswapParserVisitor from "./output/MJSiteswapParserVisitor";
import { PartialEvents } from "../../tocategorize/mj_parser";
import Fraction from "fraction.js";
import {
    AbsBeatOnlyContext,
    AbsMeasureAndBeatContext,
    AsyncMultiplexContext,
    AsyncTossContext,
    BeatFracContext,
    BeatWholeNumberContext,
    Detailed_tossContext,
    FracContext,
    HeightAccContext,
    HeightBigDigitContext,
    HeightDigitContext,
    MeasureContext,
    NumberContext,
    PatternContext,
    Rel_catchContext,
    Sync_tossContext,
    TossContext,
    TossDetailedContext,
    PatternExpContext,
    PatternParContext,
    PatternTossContext,
    TossVanillaContext
} from "./output/MJSiteswapParser";

type T = [Fraction, PartialEvents][];
// type T = string;

//TODO : toss in Lexer / Parser TODO.

export class MyVisitor extends MJSiteswapParserVisitor<void> {
    beat: Fraction;
    readonly tempo: Fraction;

    constructor(startBeat: Fraction, tempo: Fraction) {
        super();
        this.beat = startBeat.clone();
        this.tempo = tempo.clone();
    }

    appendToss(toss: ) {

    }

    visitPattern = function (ctx: PatternContext): void {

    };
    visitTossExp = function (ctx: PatternExpContext): void {
        
    };
    visitTossStd = function (ctx: PatternTossContext): void {
        
    };
    visitTossPar = function (ctx: PatternParContext): void {
        
    };
    visitNumber = function (ctx: NumberContext): void {
        
    };
    visitHeightDigit = function (ctx: HeightDigitContext): void {
        
    };
    visitHeightBigDigit = function (ctx: HeightBigDigitContext): void {
        
    };
    visitHeightAcc = function (ctx: HeightAccContext): void {
        
    };
    visitTossVanilla = function (ctx: TossVanillaContext): void {
        
    };
    visitTossDetailed = function (ctx: TossDetailedContext): void {
        
    };
    visitAsyncToss = function (ctx: AsyncTossContext): void {
        
    };
    visitAsyncMultiplex = function (ctx: AsyncMultiplexContext): void {
        
    };
    visitSync_toss = function (ctx: Sync_tossContext): void {
        
    };
    visitToss = function (ctx: TossContext): void {
        
    };
    visitMeasure = function (ctx: MeasureContext): void {
        
    };
    visitFrac = function (ctx: FracContext): void {
        
    };
    visitBeatFrac = function (ctx: BeatFracContext): void {
        
    };
    visitBeatWholeNumber = function (ctx: BeatWholeNumberContext): void {
        
    };
    visitAbsMeasureAndBeat = function (ctx: AbsMeasureAndBeatContext): void {
        
    };
    visitAbsBeatOnly = function (ctx: AbsBeatOnlyContext): void {
        
    };
    visitRel_catch = function (ctx: Rel_catchContext): void {
        
    };
    visitDetailed_toss = function (ctx: Detailed_tossContext): void {
        
    };
}

import { CharStream, CommonTokenStream } from "antlr4";
import MJSiteswapLexer from "./output/MJSiteswapLexer";
import MJSiteswapParser from "./output/MJSiteswapParser";

// Sample input
const input = "3";
const chars = new CharStream(input); // replace this with a FileStream as required
const lexer = new MJSiteswapLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new MJSiteswapParser(tokens);
const tree = parser.pattern();

const visitor = new MyVisitor();
const result = tree.accept(visitor);

console.log("Reconstructed expression:", result);
