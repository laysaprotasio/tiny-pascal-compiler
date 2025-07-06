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

    //Bloco principal do programa
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

    //Declarações
    parseVarDeclaration() {
        const varToken = this.peek();
        if (!varToken || varToken.type !== 'KEYWORD' || varToken.value !== 'var') {
            throw new Error(`Esperado 'var' no início da declaração de variável, encontrado: ${varToken ? varToken.value : 'EOF'} (linha ${varToken?.line}, coluna ${varToken?.column})`);
        }
        this.advance();
        const idents = this.parseVarList();
        const colon = this.peek();
        if (!colon || colon.type !== 'PUNCTUATION' || colon.value !== ':') {
            throw new Error(`Esperado ':' após lista de identificadores, encontrado: ${colon ? colon.value : 'EOF'} (linha ${colon?.line}, coluna ${colon?.column})`);
        }
        this.advance();
        const type = this.parseType();
        const semicolon = this.peek();
        if (!semicolon || semicolon.type !== 'PUNCTUATION' || semicolon.value !== ';') {
            throw new Error(`Esperado ';' ao final da declaração de variável, encontrado: ${semicolon ? semicolon.value : 'EOF'} (linha ${semicolon?.line}, coluna ${semicolon?.column})`);
        }
        this.advance();
        return {
            type: 'VarDeclaration',
            idents,
            varType: type.value
        };
    }

    parseVarList() {
        const idents = [];
        let token = this.peek();
        if (!token || token.type !== 'IDENTIFIER') {
            throw new Error(`Esperado identificador em declaração de variável, encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
        }
        idents.push(token.value);
        this.advance();
        while (this.peek() && this.peek().type === 'PUNCTUATION' && this.peek().value === ',') {
            this.advance(); // consome a vírgula
            token = this.peek();
            if (!token || token.type !== 'IDENTIFIER') {
                throw new Error(`Esperado identificador após ',' em declaração de variável, encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
            }
            idents.push(token.value);
            this.advance();
        }
        return idents;
    }

    parseType() {
        const token = this.peek();
        if (token && token.type === 'KEYWORD' && (token.value === 'integer' || token.value === 'boolean')) {
            this.advance();
            return { type: 'Type', value: token.value };
        } else {
            throw new Error(`Esperado tipo 'integer' ou 'boolean', encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
        }
    }

    parseProcFuncDeclaration() {
        // Implementation of parseProcFuncDeclaration method
    }

    parseProcedureDeclaration() {
        // Implementation of parseProcedureDeclaration method
    }

    parseFunctionDeclaration() {
        // Implementation of parseFunctionDeclaration method
    }

    parseParamList() {
        // Implementation of parseParamList method
    }

    parseParam() {
        // Implementation of parseParam method
    }
}

module.exports = TinyPascalParser;
    