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
            throw new Error(`Esperado '.' ao final do programa, encontrado: ${dot ? dot.value : 'EOF'}`);
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
            throw new Error("Esperado 'begin' no início do bloco, encontrado: EOF");
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
                throw new Error(`Esperado 'end' ao final do bloco, encontrado: ${found}`);
            }
        } else {
            const found = this.peek()
                ? (this.peek().value !== null ? this.peek().value : this.peek().type)
                : 'EOF';
            throw new Error(`Esperado 'begin' no início do bloco, encontrado: ${found}`);
        }
        return { type: 'Block', blockTokens };
    }
}

module.exports = TinyPascalParser;
    