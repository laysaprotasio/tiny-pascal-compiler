const { TokenType, Keywords } = require('../lexer/tokens');

class TinyPascalParser {
    constructor(tokens, symbolTable) {
        this.tokens = tokens;
        this.current = 0;
        this.symbolTable = symbolTable;
    }

    peek() {
        return this.tokens[this.current];
    }

    advance() {
        if (this.current < this.tokens.length - 1) {
            this.current++;
        }
        return this.peek();
    }

    //Bloco principal do programa
    parseProgram() {

    }

    parseGlobalDeclarations() {

    }

    parseBlock() {

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
        // <param-list> ::= <param> { ',' <param> }
        const params = [];
        params.push(this.parseParam());
        while (this.peek() && this.peek().type === 'PUNCTUATION' && this.peek().value === ',') {
            this.advance(); // consome a vírgula
            params.push(this.parseParam());
        }
        return params;
    }

    parseParam() {
        // <param> ::= <lista-id> ':' <tipo>
        const idents = this.parseVarList();
        const colon = this.peek();
        if (!colon || colon.type !== 'PUNCTUATION' || colon.value !== ':') {
            throw new Error(`Esperado ':' após lista de identificadores do parâmetro, encontrado: ${colon ? colon.value : 'EOF'} (linha ${colon?.line}, coluna ${colon?.column})`);
        }
        this.advance();
        const type = this.parseType();
        return {
            type: 'Param',
            idents,
            paramType: type.value
        };
    }


    // Indentificadores e Números
    parseIdent() {
        const token = this.peek();
        let found = 'EOF';
        if (token) {
            found = (token.type === 'EOF' || token.value === null) ? 'EOF' : token.value;
        }
        if (!token || token.type !== 'IDENTIFIER') {
            throw new Error(`Esperado identificador, encontrado: ${found} (linha ${token?.line}, coluna ${token?.column})`);
        }
        this.advance();
        return {
            type: 'Identifier',
            name: token.value,
            line: token.line,
            column: token.column
        };
    }

    parseNumber() {
        const token = this.peek();
        let found = 'EOF';
        if (token) {
            found = (token.type === 'EOF' || token.value === null) ? 'EOF' : token.value;
        }
        if (!token || token.type !== 'NUMBER') {
            throw new Error(`Esperado número, encontrado: ${found} (linha ${token?.line}, coluna ${token?.column})`);
        }
        this.advance();
        return {
            type: 'Number',
            value: token.value,
            line: token.line,
            column: token.column
        };
    }

    parseFactor() {
        const token = this.peek();
        if (!token) {
            throw new Error('Esperado fator, encontrado: EOF');
        }
        // <ident>
        if (token.type === 'IDENTIFIER') {
            return this.parseIdent();
        }
        // <number>
        if (token.type === 'NUMBER') {
            return this.parseNumber();
        }
        // '(' <expr> ')'
        if (token.type === 'PUNCTUATION' && token.value === '(') {
            this.advance();
            const expr = this.parseExpr();
            const next = this.peek();
            if (!next || next.type !== 'PUNCTUATION' || next.value !== ')') {
                throw new Error(`Esperado ')' após expressão, encontrado: ${next ? next.value : 'EOF'} (linha ${next?.line}, coluna ${next?.column})`);
            }
            this.advance();
            return { type: 'ParenExpr', expr };
        }
        // true | false
        if (token.type === 'KEYWORD' && (token.value === 'true' || token.value === 'false')) {
            this.advance();
            return { type: 'Boolean', value: token.value === 'true', line: token.line, column: token.column };
        }
        // not <factor>
        if (token.type === 'KEYWORD' && token.value === 'not') {
            this.advance();
            const factor = this.parseFactor();
            return { type: 'Not', factor };
        }
        throw new Error(`Esperado fator, encontrado: ${token.value !== null ? token.value : token.type}`);
    }

    // Expressões
    parseExpr() {
        let left = this.parseSimpleExpr();
        if (
            this.peek() &&
            this.peek().type === 'OPERATOR' &&
            ['=', '<>', '<', '<=', '>', '>='].includes(this.peek().value)
        ) {
            const operator = this.peek();
            this.advance();
            const right = this.parseSimpleExpr();
            return {
                type: 'BinaryOp',
                operator: operator.value,
                left,
                right
            };
        }
        return left;
    }

    parseSimpleExpr() {
        let left = this.parseTerm();
        while (this.peek() &&
            (
                (this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) ||
                (this.peek().type === 'KEYWORD' && this.peek().value === 'or')
            )
        ) {
            const operator = this.peek();
            this.advance();
            const right = this.parseTerm();
            left = {
                type: 'BinaryOp',
                operator: operator.value,
                left,
                right
            };
        }
        return left;
    }

    parseTerm() {
        let left = this.parseFactor();
        while (this.peek() &&
            (
                (this.peek().type === 'OPERATOR' && (this.peek().value === '*' || this.peek().value === '/')) ||
                (this.peek().type === 'KEYWORD' && this.peek().value === 'and')
            )
        ) {
            const operator = this.peek();
            this.advance();
            const right = this.parseFactor();
            left = {
                type: 'BinaryOp',
                operator: operator.value,
                left,
                right
            };
        }
        return left;
    }

    parseExprList() {
        const exprs = [];
        exprs.push(this.parseExpr());
        while (this.peek() && this.peek().type === 'PUNCTUATION' && this.peek().value === ',') {
            this.advance(); // consome a vírgula
            exprs.push(this.parseExpr());
        }
        return exprs;
    }
}

module.exports = TinyPascalParser;
