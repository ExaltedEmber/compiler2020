// Generated from gram.txt by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');



var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0002\u000eS\b\u0001\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004",
    "\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t",
    "\u0007\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004",
    "\f\t\f\u0004\r\t\r\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0004\u0003\u0004\u0003",
    "\u0005\u0003\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0007\u0003",
    "\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003\b\u0003",
    "\b\u0003\b\u0003\b\u0003\b\u0003\t\u0003\t\u0003\n\u0003\n\u0003\u000b",
    "\u0006\u000b<\n\u000b\r\u000b\u000e\u000b=\u0003\f\u0006\fA\n\f\r\f",
    "\u000e\fB\u0003\f\u0003\f\u0003\r\u0003\r\u0003\r\u0003\r\u0007\rK\n",
    "\r\f\r\u000e\rN\u000b\r\u0003\r\u0003\r\u0003\r\u0003\r\u0003L\u0002",
    "\u000e\u0003\u0003\u0005\u0004\u0007\u0005\t\u0006\u000b\u0007\r\b\u000f",
    "\t\u0011\n\u0013\u000b\u0015\f\u0017\r\u0019\u000e\u0003\u0002\b\u0003",
    "\u0002**\u0003\u0002++\u0003\u0002}}\u0003\u0002\u007f\u007f\u0003\u0002",
    "2;\u0005\u0002\u000b\f\u000f\u000f\"\"\u0002U\u0002\u0003\u0003\u0002",
    "\u0002\u0002\u0002\u0005\u0003\u0002\u0002\u0002\u0002\u0007\u0003\u0002",
    "\u0002\u0002\u0002\t\u0003\u0002\u0002\u0002\u0002\u000b\u0003\u0002",
    "\u0002\u0002\u0002\r\u0003\u0002\u0002\u0002\u0002\u000f\u0003\u0002",
    "\u0002\u0002\u0002\u0011\u0003\u0002\u0002\u0002\u0002\u0013\u0003\u0002",
    "\u0002\u0002\u0002\u0015\u0003\u0002\u0002\u0002\u0002\u0017\u0003\u0002",
    "\u0002\u0002\u0002\u0019\u0003\u0002\u0002\u0002\u0003\u001b\u0003\u0002",
    "\u0002\u0002\u0005\u001d\u0003\u0002\u0002\u0002\u0007#\u0003\u0002",
    "\u0002\u0002\t%\u0003\u0002\u0002\u0002\u000b\'\u0003\u0002\u0002\u0002",
    "\r*\u0003\u0002\u0002\u0002\u000f/\u0003\u0002\u0002\u0002\u00116\u0003",
    "\u0002\u0002\u0002\u00138\u0003\u0002\u0002\u0002\u0015;\u0003\u0002",
    "\u0002\u0002\u0017@\u0003\u0002\u0002\u0002\u0019F\u0003\u0002\u0002",
    "\u0002\u001b\u001c\u0007=\u0002\u0002\u001c\u0004\u0003\u0002\u0002",
    "\u0002\u001d\u001e\u0007y\u0002\u0002\u001e\u001f\u0007j\u0002\u0002",
    "\u001f \u0007k\u0002\u0002 !\u0007n\u0002\u0002!\"\u0007g\u0002\u0002",
    "\"\u0006\u0003\u0002\u0002\u0002#$\t\u0002\u0002\u0002$\b\u0003\u0002",
    "\u0002\u0002%&\t\u0003\u0002\u0002&\n\u0003\u0002\u0002\u0002\'(\u0007",
    "k\u0002\u0002()\u0007h\u0002\u0002)\f\u0003\u0002\u0002\u0002*+\u0007",
    "g\u0002\u0002+,\u0007n\u0002\u0002,-\u0007u\u0002\u0002-.\u0007g\u0002",
    "\u0002.\u000e\u0003\u0002\u0002\u0002/0\u0007t\u0002\u000201\u0007g",
    "\u0002\u000212\u0007v\u0002\u000223\u0007w\u0002\u000234\u0007t\u0002",
    "\u000245\u0007p\u0002\u00025\u0010\u0003\u0002\u0002\u000267\t\u0004",
    "\u0002\u00027\u0012\u0003\u0002\u0002\u000289\t\u0005\u0002\u00029\u0014",
    "\u0003\u0002\u0002\u0002:<\t\u0006\u0002\u0002;:\u0003\u0002\u0002\u0002",
    "<=\u0003\u0002\u0002\u0002=;\u0003\u0002\u0002\u0002=>\u0003\u0002\u0002",
    "\u0002>\u0016\u0003\u0002\u0002\u0002?A\t\u0007\u0002\u0002@?\u0003",
    "\u0002\u0002\u0002AB\u0003\u0002\u0002\u0002B@\u0003\u0002\u0002\u0002",
    "BC\u0003\u0002\u0002\u0002CD\u0003\u0002\u0002\u0002DE\b\f\u0002\u0002",
    "E\u0018\u0003\u0002\u0002\u0002FG\u00071\u0002\u0002GH\u00071\u0002",
    "\u0002HL\u0003\u0002\u0002\u0002IK\u000b\u0002\u0002\u0002JI\u0003\u0002",
    "\u0002\u0002KN\u0003\u0002\u0002\u0002LM\u0003\u0002\u0002\u0002LJ\u0003",
    "\u0002\u0002\u0002MO\u0003\u0002\u0002\u0002NL\u0003\u0002\u0002\u0002",
    "OP\u0007\f\u0002\u0002PQ\u0003\u0002\u0002\u0002QR\b\r\u0002\u0002R",
    "\u001a\u0003\u0002\u0002\u0002\u0006\u0002=BL\u0003\b\u0002\u0002"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

function gramLexer(input) {
	antlr4.Lexer.call(this, input);
    this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    return this;
}

gramLexer.prototype = Object.create(antlr4.Lexer.prototype);
gramLexer.prototype.constructor = gramLexer;

Object.defineProperty(gramLexer.prototype, "atn", {
        get : function() {
                return atn;
        }
});

gramLexer.EOF = antlr4.Token.EOF;
gramLexer.SEMI = 1;
gramLexer.WHILE = 2;
gramLexer.LP = 3;
gramLexer.RP = 4;
gramLexer.IF = 5;
gramLexer.ELSE = 6;
gramLexer.RETURN = 7;
gramLexer.LBR = 8;
gramLexer.RBR = 9;
gramLexer.NUM = 10;
gramLexer.WHITESPACE = 11;
gramLexer.COMMENT = 12;

gramLexer.prototype.channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];

gramLexer.prototype.modeNames = [ "DEFAULT_MODE" ];

gramLexer.prototype.literalNames = [ null, "';'", "'while'", null, null, 
                                     "'if'", "'else'", "'return'" ];

gramLexer.prototype.symbolicNames = [ null, "SEMI", "WHILE", "LP", "RP", 
                                      "IF", "ELSE", "RETURN", "LBR", "RBR", 
                                      "NUM", "WHITESPACE", "COMMENT" ];

gramLexer.prototype.ruleNames = [ "SEMI", "WHILE", "LP", "RP", "IF", "ELSE", 
                                  "RETURN", "LBR", "RBR", "NUM", "WHITESPACE", 
                                  "COMMENT" ];

gramLexer.prototype.grammarFileName = "gram.txt";


exports.gramLexer = gramLexer;

