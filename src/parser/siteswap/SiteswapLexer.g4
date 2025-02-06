lexer grammar SiteswapLexer;

DIGIT: [0-9] | [a-w];
LACC: '{' -> pushMode(MULTIPLE_DIGITS);
REP: '^' -> pushMode(MULTIPLE_DIGITS);
LPAR: '(';
RPAR: ')';
LBRA: '[';
RBRA: ']';
X_MOD: 'x';
L_MOD: 'L';
R_MOD: 'R';
COMMA: ',';
EXCL: '!';
WS: [ \n\t\r\f]+ -> skip;

mode MULTIPLE_DIGITS;
NUMBER: [0-9]+;
MD_RACC: '}' -> popMode;
MD_WS: WS -> skip, popMode;
// MD_WS: MD_RPAR: RPAR -> popMode, type(RPAR);