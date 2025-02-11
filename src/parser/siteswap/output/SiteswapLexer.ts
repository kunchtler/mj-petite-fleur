// Generated from SiteswapLexer.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class SiteswapLexer extends Lexer {
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
	public static readonly EOF = Token.EOF;
	public static readonly MULTIPLE_DIGITS = 1;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", "MULTIPLE_DIGITS", ];

	public static readonly ruleNames: string[] = [
		"DIGIT", "LACC", "REP", "LPAR", "RPAR", "LBRA", "RBRA", "X_MOD", "L_MOD", 
		"R_MOD", "COMMA", "EXCL", "WS", "NUMBER", "MD_RACC", "MD_WS",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, SiteswapLexer._ATN, SiteswapLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "SiteswapLexer.g4"; }

	public get literalNames(): (string | null)[] { return SiteswapLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return SiteswapLexer.symbolicNames; }
	public get ruleNames(): string[] { return SiteswapLexer.ruleNames; }

	public get serializedATN(): number[] { return SiteswapLexer._serializedATN; }

	public get channelNames(): string[] { return SiteswapLexer.channelNames; }

	public get modeNames(): string[] { return SiteswapLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,16,84,6,-1,6,-1,
	2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,
	2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,1,0,
	3,0,36,8,0,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,6,
	1,6,1,7,1,7,1,8,1,8,1,9,1,9,1,10,1,10,1,11,1,11,1,12,4,12,65,8,12,11,12,
	12,12,66,1,12,1,12,1,13,4,13,72,8,13,11,13,12,13,73,1,14,1,14,1,14,1,14,
	1,15,1,15,1,15,1,15,1,15,0,0,16,2,1,4,2,6,3,8,4,10,5,12,6,14,7,16,8,18,
	9,20,10,22,11,24,12,26,13,28,14,30,15,32,16,2,0,1,3,2,0,48,57,97,119,3,
	0,9,10,12,13,32,32,1,0,48,57,84,0,2,1,0,0,0,0,4,1,0,0,0,0,6,1,0,0,0,0,8,
	1,0,0,0,0,10,1,0,0,0,0,12,1,0,0,0,0,14,1,0,0,0,0,16,1,0,0,0,0,18,1,0,0,
	0,0,20,1,0,0,0,0,22,1,0,0,0,0,24,1,0,0,0,0,26,1,0,0,0,1,28,1,0,0,0,1,30,
	1,0,0,0,1,32,1,0,0,0,2,35,1,0,0,0,4,37,1,0,0,0,6,41,1,0,0,0,8,45,1,0,0,
	0,10,47,1,0,0,0,12,49,1,0,0,0,14,51,1,0,0,0,16,53,1,0,0,0,18,55,1,0,0,0,
	20,57,1,0,0,0,22,59,1,0,0,0,24,61,1,0,0,0,26,64,1,0,0,0,28,71,1,0,0,0,30,
	75,1,0,0,0,32,79,1,0,0,0,34,36,7,0,0,0,35,34,1,0,0,0,36,3,1,0,0,0,37,38,
	5,123,0,0,38,39,1,0,0,0,39,40,6,1,0,0,40,5,1,0,0,0,41,42,5,94,0,0,42,43,
	1,0,0,0,43,44,6,2,0,0,44,7,1,0,0,0,45,46,5,40,0,0,46,9,1,0,0,0,47,48,5,
	41,0,0,48,11,1,0,0,0,49,50,5,91,0,0,50,13,1,0,0,0,51,52,5,93,0,0,52,15,
	1,0,0,0,53,54,5,120,0,0,54,17,1,0,0,0,55,56,5,76,0,0,56,19,1,0,0,0,57,58,
	5,82,0,0,58,21,1,0,0,0,59,60,5,44,0,0,60,23,1,0,0,0,61,62,5,33,0,0,62,25,
	1,0,0,0,63,65,7,1,0,0,64,63,1,0,0,0,65,66,1,0,0,0,66,64,1,0,0,0,66,67,1,
	0,0,0,67,68,1,0,0,0,68,69,6,12,1,0,69,27,1,0,0,0,70,72,7,2,0,0,71,70,1,
	0,0,0,72,73,1,0,0,0,73,71,1,0,0,0,73,74,1,0,0,0,74,29,1,0,0,0,75,76,5,125,
	0,0,76,77,1,0,0,0,77,78,6,14,2,0,78,31,1,0,0,0,79,80,3,26,12,0,80,81,1,
	0,0,0,81,82,6,15,1,0,82,83,6,15,2,0,83,33,1,0,0,0,5,0,1,35,66,73,3,5,1,
	0,6,0,0,4,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SiteswapLexer.__ATN) {
			SiteswapLexer.__ATN = new ATNDeserializer().deserialize(SiteswapLexer._serializedATN);
		}

		return SiteswapLexer.__ATN;
	}


	static DecisionsToDFA = SiteswapLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}