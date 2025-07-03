const { TokenType, Keywords, Operators, Punctuation } = require('./tokens');

class TinyPascalLexer {
  constructor(sourceCode) {
    this.sourceCode = sourceCode;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.currentChar = this.sourceCode[0];
  }

}

module.exports = TinyPascalLexer;