const { TokenType, Keywords } = require('../lexer/tokens');

class TinyPascalParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    peek() {
        return this.tokens[this.current];
    }

    lookahead() {
        return this.tokens[this.current + 1];
    }

    advance() {
        if (this.current < this.tokens.length - 1) {
            this.current++;
        }
        return this.peek();
    }

    parseProgram() {
        const globalDeclarations = this.parseGlobalDeclarations();
        const block = this.parseBlock();
        const dot = this.peek();
        if (!dot || dot.type !== 'PUNCTUATION' || dot.value !== '.') {
            const line = dot ? dot.line : (this.tokens[this.tokens.length - 1]?.line || 0);
            const column = dot ? dot.column : (this.tokens[this.tokens.length - 1]?.column || 0);
            throw new Error(`Esperado '.' ao final do programa, encontrado: ${dot ? dot.value : 'EOF'} (linha ${line}, coluna ${column})`);
        }
        this.advance();
        return {
            type: 'Program',
            globalDeclarations,
            block
        };
    }

    parseGlobalDeclarations() {
        const declarations = [];
        while (
            this.peek() &&
            !(this.peek().type === 'KEYWORD' && this.peek().value === 'begin') &&
            this.peek().type !== 'EOF'
        ) {
            declarations.push(this.peek());
            this.advance();
        }
        if (!this.peek() || this.peek().type === 'EOF') {
            const token = this.peek() || this.tokens[this.tokens.length - 1];
            throw new Error(`Esperado 'begin' no início do bloco, encontrado: EOF (linha ${token.line}, coluna ${token.column})`);
        }
        return { type: 'GlobalDeclarations', declarations };
    }

    parseBlock() {
        const blockTokens = [];
        if (this.peek() && this.peek().type === 'KEYWORD' && this.peek().value === 'begin') {
            blockTokens.push(this.peek());
            this.advance();
            while (
                this.peek() &&
                !(this.peek().type === 'KEYWORD' && this.peek().value === 'end') &&
                this.peek().type !== 'EOF'
            ) {
                blockTokens.push(this.peek());
                this.advance();
            }
            if (this.peek() && this.peek().type === 'KEYWORD' && this.peek().value === 'end') {
                blockTokens.push(this.peek());
                this.advance();
            } else {
                const found = this.peek()
                    ? (this.peek().value !== null ? this.peek().value : this.peek().type)
                    : 'EOF';
                const token = this.peek() || this.tokens[this.tokens.length - 1];
                throw new Error(`Esperado 'end' ao final do bloco, encontrado: ${found} (linha ${token.line}, coluna ${token.column})`);
            }
        } else {
            const found = this.peek()
                ? (this.peek().value !== null ? this.peek().value : this.peek().type)
                : 'EOF';
            const token = this.peek() || this.tokens[this.tokens.length - 1];
            throw new Error(`Esperado 'begin' no início do bloco, encontrado: ${found} (linha ${token.line}, coluna ${token.column})`);
        }
        return { type: 'Block', blockTokens };
    }
}

module.exports = TinyPascalParser;
    