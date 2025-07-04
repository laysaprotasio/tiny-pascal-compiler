const { TokenType, Keywords, Operators, Punctuation } = require('./tokens');

class TinyPascalLexer {
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.currentChar = this.sourceCode[0];
    }


    advance() {
        if (this.currentChar === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }

        this.position++;
        this.currentChar =
            this.position < this.sourceCode.length
                ? this.sourceCode[this.position]
                : null;
    }

    skipWhitespace() {
        while (this.currentChar !== null && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }

    peek() {
        const nextPos = this.position + 1;
        return nextPos < this.sourceCode.length ? this.sourceCode[nextPos] : null;
    }

    getNextToken() {
        this.skipWhitespace();

        if (this.currentChar === null) {
            return {
                type: TokenType.EOF,
                value: null,
                line: this.line,
                column: this.column
            };
        }

        if (this.currentChar === "'") {
            return this.readString();
        }

        if (/\d/.test(this.currentChar)) {
            return this.readNumber();
        }

        if (/[a-zA-Z_]/.test(this.currentChar)) {
            return this.readIdentifier();
        }

        const twoCharOp = this.currentChar + (this.peek() || '');
        if ([Operators.ASSIGN, Operators.NOT_EQUAL, Operators.LESS_EQUAL, Operators.GREATER_EQUAL].includes(twoCharOp)) {
            const token = {
                type: TokenType.OPERATOR,
                value: twoCharOp,
                line: this.line,
                column: this.column
            };
            this.advance();
            this.advance();
            return token;
        }

        if ([Operators.PLUS, Operators.MINUS, Operators.MULTIPLY, Operators.DIVIDE, Operators.EQUAL, Operators.LESS, Operators.GREATER].includes(this.currentChar)) {
            const token = {
                type: TokenType.OPERATOR,
                value: this.currentChar,
                line: this.line,
                column: this.column
            };
            this.advance();
            return token;
        }

        if (Object.values(Punctuation).includes(this.currentChar)) {
            const token = {
                type: TokenType.PUNCTUATION,
                value: this.currentChar,
                line: this.line,
                column: this.column
            };
            this.advance();
            return token;
        }

        const unknownChar = this.currentChar;
        const token = {
            type: 'UNKNOWN',
            value: unknownChar,
            line: this.line,
            column: this.column
        };
        this.advance();
        return token;
    }

    tokenize() {
        const tokens = [];
        let token;
        do {
            token = this.getNextToken();
            tokens.push(token);
        } while (token.type !== TokenType.EOF);
        return tokens;
    }

    readNumber() {
        let number = '';
        while (this.currentChar !== null && /\d/.test(this.currentChar)) {
            number += this.currentChar;
            this.advance();
        }
        return {
            type: TokenType.NUMBER,
            value: parseInt(number, 10),
            line: this.line,
            column: this.column - number.length
        };
    }

    readIdentifier() {
        if (!/[a-zA-Z_]/.test(this.currentChar)) {
            return {
                type: TokenType.IDENTIFIER,
                value: '',
                line: this.line,
                column: this.column
            };
        }

        let identifier = '';
        const startColumn = this.column;

        while (this.currentChar !== null && /[a-zA-Z0-9_]/.test(this.currentChar)) {
            identifier += this.currentChar;
            this.advance();
        }

        return {
            type: Keywords.includes(identifier.toLowerCase()) ? TokenType.KEYWORD : TokenType.IDENTIFIER,
            value: identifier,
            line: this.line,
            column: startColumn
        };
    }

    readString() {
        if (this.currentChar !== "'") {
            return {
                type: TokenType.STRING,
                value: '',
                line: this.line,
                column: this.column
            };
        }
        const quoteType = this.currentChar;
        let str = '';
        const startLine = this.line;
        const startColumn = this.column;
        this.advance();
        while (this.currentChar !== null && this.currentChar !== quoteType) {
            str += this.currentChar;
            this.advance();
        }
        if (this.currentChar === quoteType) {
            this.advance();
        } else {
            throw new Error(`String não terminada na linha ${startLine}, coluna ${startColumn}`);
        }
        return {
            type: TokenType.STRING,
            value: str,
            line: startLine,
            column: startColumn
        };
    }
}


module.exports = TinyPascalLexer;