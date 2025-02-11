// Generated from SiteswapParser.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import SiteswapParserListener from "./SiteswapParserListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class SiteswapParser extends Parser {
	public static readonly DIGIT = 1;
	public static readonly LACC = 2;
	public static readonly REP = 3;
	public static readonly LPAR = 4;
	public static readonly RPAR = 5;
	public static readonly LBRA = 6;
	public static readonly RBRA = 7;
	public static readonly X_MOD = 8;
	public static readonly L_MOD = 9;
	public static readonly R_MOD = 10;
	public static readonly COMMA = 11;
	public static readonly EXCL = 12;
	public static readonly WS = 13;
	public static readonly NUMBER = 14;
	public static readonly MD_RACC = 15;
	public static readonly MD_WS = 16;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_pattern = 0;
	public static readonly RULE_pattern_atom = 1;
	public static readonly RULE_height = 2;
	public static readonly RULE_async_throw = 3;
	public static readonly RULE_sync_throw = 4;
	public static readonly RULE_throw = 5;
	public static readonly RULE_hand_mod = 6;
	public static readonly RULE_x_mod = 7;
	public static readonly RULE_excl_mod = 8;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            "'{'", "'^'", 
                                                            "'('", "')'", 
                                                            "'['", "']'", 
                                                            "'x'", "'L'", 
                                                            "'R'", "','", 
                                                            "'!'", null, 
                                                            null, "'}'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "DIGIT", 
                                                             "LACC", "REP", 
                                                             "LPAR", "RPAR", 
                                                             "LBRA", "RBRA", 
                                                             "X_MOD", "L_MOD", 
                                                             "R_MOD", "COMMA", 
                                                             "EXCL", "WS", 
                                                             "NUMBER", "MD_RACC", 
                                                             "MD_WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"pattern", "pattern_atom", "height", "async_throw", "sync_throw", "throw", 
		"hand_mod", "x_mod", "excl_mod",
	];
	public get grammarFileName(): string { return "SiteswapParser.g4"; }
	public get literalNames(): (string | null)[] { return SiteswapParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return SiteswapParser.symbolicNames; }
	public get ruleNames(): string[] { return SiteswapParser.ruleNames; }
	public get serializedATN(): number[] { return SiteswapParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, SiteswapParser._ATN, SiteswapParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public pattern(): PatternContext {
		let localctx: PatternContext = new PatternContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, SiteswapParser.RULE_pattern);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 19;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 18;
				this.pattern_atom(0);
				}
				}
				this.state = 21;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1622) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public pattern_atom(): Pattern_atomContext;
	public pattern_atom(_p: number): Pattern_atomContext;
	// @RuleVersion(0)
	public pattern_atom(_p?: number): Pattern_atomContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Pattern_atomContext = new Pattern_atomContext(this, this._ctx, _parentState);
		let _prevctx: Pattern_atomContext = localctx;
		let _startState: number = 2;
		this.enterRecursionRule(localctx, 2, SiteswapParser.RULE_pattern_atom, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 29;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				{
				this.state = 24;
				this.throw_();
				}
				break;
			case 2:
				{
				this.state = 25;
				this.match(SiteswapParser.LPAR);
				this.state = 26;
				this.pattern();
				this.state = 27;
				this.match(SiteswapParser.RPAR);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 36;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 2, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Pattern_atomContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, SiteswapParser.RULE_pattern_atom);
					this.state = 31;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 32;
					this.match(SiteswapParser.REP);
					this.state = 33;
					this.match(SiteswapParser.NUMBER);
					}
					}
				}
				this.state = 38;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 2, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public height(): HeightContext {
		let localctx: HeightContext = new HeightContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, SiteswapParser.RULE_height);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 43;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
				{
				this.state = 39;
				this.match(SiteswapParser.DIGIT);
				}
				break;
			case 2:
				{
				this.state = 40;
				this.match(SiteswapParser.LACC);
				this.state = 41;
				this.match(SiteswapParser.NUMBER);
				this.state = 42;
				this.match(SiteswapParser.MD_RACC);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 46;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				{
				this.state = 45;
				this.x_mod();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public async_throw(): Async_throwContext {
		let localctx: Async_throwContext = new Async_throwContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, SiteswapParser.RULE_async_throw);
		let _la: number;
		try {
			this.state = 57;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
			case 2:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 48;
				this.height();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 49;
				this.match(SiteswapParser.LBRA);
				this.state = 51;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 50;
					this.height();
					}
					}
					this.state = 53;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la===1 || _la===2);
				this.state = 55;
				this.match(SiteswapParser.RBRA);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public sync_throw(): Sync_throwContext {
		let localctx: Sync_throwContext = new Sync_throwContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, SiteswapParser.RULE_sync_throw);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 59;
			this.match(SiteswapParser.LPAR);
			this.state = 60;
			this.async_throw();
			this.state = 61;
			this.match(SiteswapParser.COMMA);
			this.state = 62;
			this.async_throw();
			this.state = 63;
			this.match(SiteswapParser.RPAR);
			this.state = 65;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				{
				this.state = 64;
				this.excl_mod();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public throw_(): ThrowContext {
		let localctx: ThrowContext = new ThrowContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, SiteswapParser.RULE_throw);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 68;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===9 || _la===10) {
				{
				this.state = 67;
				this.hand_mod();
				}
			}

			this.state = 72;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
				{
				this.state = 70;
				this.sync_throw();
				}
				break;
			case 1:
			case 2:
			case 6:
				{
				this.state = 71;
				this.async_throw();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public hand_mod(): Hand_modContext {
		let localctx: Hand_modContext = new Hand_modContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, SiteswapParser.RULE_hand_mod);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 74;
			_la = this._input.LA(1);
			if(!(_la===9 || _la===10)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public x_mod(): X_modContext {
		let localctx: X_modContext = new X_modContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, SiteswapParser.RULE_x_mod);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 76;
			this.match(SiteswapParser.X_MOD);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public excl_mod(): Excl_modContext {
		let localctx: Excl_modContext = new Excl_modContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, SiteswapParser.RULE_excl_mod);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 78;
			this.match(SiteswapParser.EXCL);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.pattern_atom_sempred(localctx as Pattern_atomContext, predIndex);
		}
		return true;
	}
	private pattern_atom_sempred(localctx: Pattern_atomContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,16,81,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,1,0,4,0,20,
	8,0,11,0,12,0,21,1,1,1,1,1,1,1,1,1,1,1,1,3,1,30,8,1,1,1,1,1,1,1,5,1,35,
	8,1,10,1,12,1,38,9,1,1,2,1,2,1,2,1,2,3,2,44,8,2,1,2,3,2,47,8,2,1,3,1,3,
	1,3,4,3,52,8,3,11,3,12,3,53,1,3,1,3,3,3,58,8,3,1,4,1,4,1,4,1,4,1,4,1,4,
	3,4,66,8,4,1,5,3,5,69,8,5,1,5,1,5,3,5,73,8,5,1,6,1,6,1,7,1,7,1,8,1,8,1,
	8,0,1,2,9,0,2,4,6,8,10,12,14,16,0,1,1,0,9,10,81,0,19,1,0,0,0,2,29,1,0,0,
	0,4,43,1,0,0,0,6,57,1,0,0,0,8,59,1,0,0,0,10,68,1,0,0,0,12,74,1,0,0,0,14,
	76,1,0,0,0,16,78,1,0,0,0,18,20,3,2,1,0,19,18,1,0,0,0,20,21,1,0,0,0,21,19,
	1,0,0,0,21,22,1,0,0,0,22,1,1,0,0,0,23,24,6,1,-1,0,24,30,3,10,5,0,25,26,
	5,4,0,0,26,27,3,0,0,0,27,28,5,5,0,0,28,30,1,0,0,0,29,23,1,0,0,0,29,25,1,
	0,0,0,30,36,1,0,0,0,31,32,10,1,0,0,32,33,5,3,0,0,33,35,5,14,0,0,34,31,1,
	0,0,0,35,38,1,0,0,0,36,34,1,0,0,0,36,37,1,0,0,0,37,3,1,0,0,0,38,36,1,0,
	0,0,39,44,5,1,0,0,40,41,5,2,0,0,41,42,5,14,0,0,42,44,5,15,0,0,43,39,1,0,
	0,0,43,40,1,0,0,0,44,46,1,0,0,0,45,47,3,14,7,0,46,45,1,0,0,0,46,47,1,0,
	0,0,47,5,1,0,0,0,48,58,3,4,2,0,49,51,5,6,0,0,50,52,3,4,2,0,51,50,1,0,0,
	0,52,53,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,55,1,0,0,0,55,56,5,7,0,0,
	56,58,1,0,0,0,57,48,1,0,0,0,57,49,1,0,0,0,58,7,1,0,0,0,59,60,5,4,0,0,60,
	61,3,6,3,0,61,62,5,11,0,0,62,63,3,6,3,0,63,65,5,5,0,0,64,66,3,16,8,0,65,
	64,1,0,0,0,65,66,1,0,0,0,66,9,1,0,0,0,67,69,3,12,6,0,68,67,1,0,0,0,68,69,
	1,0,0,0,69,72,1,0,0,0,70,73,3,8,4,0,71,73,3,6,3,0,72,70,1,0,0,0,72,71,1,
	0,0,0,73,11,1,0,0,0,74,75,7,0,0,0,75,13,1,0,0,0,76,77,5,8,0,0,77,15,1,0,
	0,0,78,79,5,12,0,0,79,17,1,0,0,0,10,21,29,36,43,46,53,57,65,68,72];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SiteswapParser.__ATN) {
			SiteswapParser.__ATN = new ATNDeserializer().deserialize(SiteswapParser._serializedATN);
		}

		return SiteswapParser.__ATN;
	}


	static DecisionsToDFA = SiteswapParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class PatternContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public pattern_atom_list(): Pattern_atomContext[] {
		return this.getTypedRuleContexts(Pattern_atomContext) as Pattern_atomContext[];
	}
	public pattern_atom(i: number): Pattern_atomContext {
		return this.getTypedRuleContext(Pattern_atomContext, i) as Pattern_atomContext;
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_pattern;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterPattern) {
	 		listener.enterPattern(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitPattern) {
	 		listener.exitPattern(this);
		}
	}
}


export class Pattern_atomContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public throw_(): ThrowContext {
		return this.getTypedRuleContext(ThrowContext, 0) as ThrowContext;
	}
	public LPAR(): TerminalNode {
		return this.getToken(SiteswapParser.LPAR, 0);
	}
	public pattern(): PatternContext {
		return this.getTypedRuleContext(PatternContext, 0) as PatternContext;
	}
	public RPAR(): TerminalNode {
		return this.getToken(SiteswapParser.RPAR, 0);
	}
	public pattern_atom(): Pattern_atomContext {
		return this.getTypedRuleContext(Pattern_atomContext, 0) as Pattern_atomContext;
	}
	public REP(): TerminalNode {
		return this.getToken(SiteswapParser.REP, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(SiteswapParser.NUMBER, 0);
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_pattern_atom;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterPattern_atom) {
	 		listener.enterPattern_atom(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitPattern_atom) {
	 		listener.exitPattern_atom(this);
		}
	}
}


export class HeightContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DIGIT(): TerminalNode {
		return this.getToken(SiteswapParser.DIGIT, 0);
	}
	public LACC(): TerminalNode {
		return this.getToken(SiteswapParser.LACC, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(SiteswapParser.NUMBER, 0);
	}
	public MD_RACC(): TerminalNode {
		return this.getToken(SiteswapParser.MD_RACC, 0);
	}
	public x_mod(): X_modContext {
		return this.getTypedRuleContext(X_modContext, 0) as X_modContext;
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_height;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterHeight) {
	 		listener.enterHeight(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitHeight) {
	 		listener.exitHeight(this);
		}
	}
}


export class Async_throwContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public height_list(): HeightContext[] {
		return this.getTypedRuleContexts(HeightContext) as HeightContext[];
	}
	public height(i: number): HeightContext {
		return this.getTypedRuleContext(HeightContext, i) as HeightContext;
	}
	public LBRA(): TerminalNode {
		return this.getToken(SiteswapParser.LBRA, 0);
	}
	public RBRA(): TerminalNode {
		return this.getToken(SiteswapParser.RBRA, 0);
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_async_throw;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterAsync_throw) {
	 		listener.enterAsync_throw(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitAsync_throw) {
	 		listener.exitAsync_throw(this);
		}
	}
}


export class Sync_throwContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LPAR(): TerminalNode {
		return this.getToken(SiteswapParser.LPAR, 0);
	}
	public async_throw_list(): Async_throwContext[] {
		return this.getTypedRuleContexts(Async_throwContext) as Async_throwContext[];
	}
	public async_throw(i: number): Async_throwContext {
		return this.getTypedRuleContext(Async_throwContext, i) as Async_throwContext;
	}
	public COMMA(): TerminalNode {
		return this.getToken(SiteswapParser.COMMA, 0);
	}
	public RPAR(): TerminalNode {
		return this.getToken(SiteswapParser.RPAR, 0);
	}
	public excl_mod(): Excl_modContext {
		return this.getTypedRuleContext(Excl_modContext, 0) as Excl_modContext;
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_sync_throw;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterSync_throw) {
	 		listener.enterSync_throw(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitSync_throw) {
	 		listener.exitSync_throw(this);
		}
	}
}


export class ThrowContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public sync_throw(): Sync_throwContext {
		return this.getTypedRuleContext(Sync_throwContext, 0) as Sync_throwContext;
	}
	public async_throw(): Async_throwContext {
		return this.getTypedRuleContext(Async_throwContext, 0) as Async_throwContext;
	}
	public hand_mod(): Hand_modContext {
		return this.getTypedRuleContext(Hand_modContext, 0) as Hand_modContext;
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_throw;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterThrow) {
	 		listener.enterThrow(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitThrow) {
	 		listener.exitThrow(this);
		}
	}
}


export class Hand_modContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public L_MOD(): TerminalNode {
		return this.getToken(SiteswapParser.L_MOD, 0);
	}
	public R_MOD(): TerminalNode {
		return this.getToken(SiteswapParser.R_MOD, 0);
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_hand_mod;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterHand_mod) {
	 		listener.enterHand_mod(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitHand_mod) {
	 		listener.exitHand_mod(this);
		}
	}
}


export class X_modContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public X_MOD(): TerminalNode {
		return this.getToken(SiteswapParser.X_MOD, 0);
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_x_mod;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterX_mod) {
	 		listener.enterX_mod(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitX_mod) {
	 		listener.exitX_mod(this);
		}
	}
}


export class Excl_modContext extends ParserRuleContext {
	constructor(parser?: SiteswapParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EXCL(): TerminalNode {
		return this.getToken(SiteswapParser.EXCL, 0);
	}
    public get ruleIndex(): number {
    	return SiteswapParser.RULE_excl_mod;
	}
	public enterRule(listener: SiteswapParserListener): void {
	    if(listener.enterExcl_mod) {
	 		listener.enterExcl_mod(this);
		}
	}
	public exitRule(listener: SiteswapParserListener): void {
	    if(listener.exitExcl_mod) {
	 		listener.exitExcl_mod(this);
		}
	}
}
