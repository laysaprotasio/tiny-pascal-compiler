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
}

module.exports = TinyPascalParser;
    