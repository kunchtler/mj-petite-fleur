// Generated from SiteswapParser.g4 by ANTLR 4.13.2

import {ParseTreeListener} from "antlr4";


import { PatternContext } from "./SiteswapParser.js";
import { Pattern_atomContext } from "./SiteswapParser.js";
import { HeightContext } from "./SiteswapParser.js";
import { Async_throwContext } from "./SiteswapParser.js";
import { Sync_throwContext } from "./SiteswapParser.js";
import { ThrowContext } from "./SiteswapParser.js";
import { Hand_modContext } from "./SiteswapParser.js";
import { X_modContext } from "./SiteswapParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `SiteswapParser`.
 */
export default class SiteswapParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `SiteswapParser.pattern`.
	 * @param ctx the parse tree
	 */
	enterPattern?: (ctx: PatternContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.pattern`.
	 * @param ctx the parse tree
	 */
	exitPattern?: (ctx: PatternContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.pattern_atom`.
	 * @param ctx the parse tree
	 */
	enterPattern_atom?: (ctx: Pattern_atomContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.pattern_atom`.
	 * @param ctx the parse tree
	 */
	exitPattern_atom?: (ctx: Pattern_atomContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.height`.
	 * @param ctx the parse tree
	 */
	enterHeight?: (ctx: HeightContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.height`.
	 * @param ctx the parse tree
	 */
	exitHeight?: (ctx: HeightContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.async_throw`.
	 * @param ctx the parse tree
	 */
	enterAsync_throw?: (ctx: Async_throwContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.async_throw`.
	 * @param ctx the parse tree
	 */
	exitAsync_throw?: (ctx: Async_throwContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.sync_throw`.
	 * @param ctx the parse tree
	 */
	enterSync_throw?: (ctx: Sync_throwContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.sync_throw`.
	 * @param ctx the parse tree
	 */
	exitSync_throw?: (ctx: Sync_throwContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.throw`.
	 * @param ctx the parse tree
	 */
	enterThrow?: (ctx: ThrowContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.throw`.
	 * @param ctx the parse tree
	 */
	exitThrow?: (ctx: ThrowContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.hand_mod`.
	 * @param ctx the parse tree
	 */
	enterHand_mod?: (ctx: Hand_modContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.hand_mod`.
	 * @param ctx the parse tree
	 */
	exitHand_mod?: (ctx: Hand_modContext) => void;
	/**
	 * Enter a parse tree produced by `SiteswapParser.x_mod`.
	 * @param ctx the parse tree
	 */
	enterX_mod?: (ctx: X_modContext) => void;
	/**
	 * Exit a parse tree produced by `SiteswapParser.x_mod`.
	 * @param ctx the parse tree
	 */
	exitX_mod?: (ctx: X_modContext) => void;
}

