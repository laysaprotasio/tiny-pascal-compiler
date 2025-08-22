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
        // <programa> ::= <declarações-globais> <bloco> '.'
        const globals = this.parseGlobalDeclarations();
        const block = this.parseBlock();
        const dot = this.peek();
        if (!dot || dot.type !== 'PUNCTUATION' || dot.value !== '.') {
            throw new Error(`Esperado '.' ao final do programa, encontrado: ${dot ? dot.value : 'EOF'} (linha ${dot?.line}, coluna ${dot?.column})`);
        }
        this.advance();
        return {
            type: 'Program',
            declarations: globals,
            main: block
        };
    }

    parseGlobalDeclarations() {
        // <declarações-globais> ::= [ 'var' { <decl-var> } ] { <decl-proc-func> }
        const declarations = [];

        if (this.peek() && this.peek().type === 'KEYWORD' && this.peek().value === 'var') {
            this.advance(); // consome 'var'
            while (this.peek() && this.peek().type === 'IDENTIFIER') {
                declarations.push(this.parseVarDeclarationSemVar());
            }
        }

        while (this.peek() && this.peek().type === 'KEYWORD' && (this.peek().value === 'procedure' || this.peek().value === 'function')) {
            declarations.push(this.parseProcFuncDeclaration());
        }
        return declarations;
    }

    parseBlock() {
        const beginToken = this.peek();
        if (!beginToken || beginToken.type !== 'KEYWORD' || beginToken.value !== 'begin') {
            throw new Error(`Esperado 'begin' no início do bloco, encontrado: ${beginToken ? beginToken.value : 'EOF'} (linha ${beginToken?.line}, coluna ${beginToken?.column})`);
        }
        this.advance();

        const stmtList = this.parseStmtList();

        const endToken = this.peek();
        if (!endToken || endToken.type !== 'KEYWORD' || endToken.value !== 'end') {
            throw new Error(`Esperado 'end' ao final do bloco, encontrado: ${endToken ? endToken.value : 'EOF'} (linha ${endToken?.line}, coluna ${endToken?.column})`);
        }
        this.advance(); 

        return {
            type: 'Block',
            statements: stmtList,
            line: beginToken.line,
            column: beginToken.column
        };
    }

    //Declarações
    parseVarDeclarationSemVar() {
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
            this.advance(); 
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
        // <decl-proc-func> ::= <decl-procedimento> | <decl-funcao>
        const token = this.peek();
        if (token && token.type === 'KEYWORD' && token.value === 'procedure') {
            return this.parseProcedureDeclaration();
        } else if (token && token.type === 'KEYWORD' && token.value === 'function') {
            return this.parseFunctionDeclaration();
        } else {
            throw new Error(`Esperado 'procedure' ou 'function' no início da declaração, encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
        }
    }

    parseProcedureDeclaration() {
        // procedure <ident> [ '(' <param-list> ')' ] ';' <bloco> ';'
        const procToken = this.peek();
        if (!procToken || procToken.type !== 'KEYWORD' || procToken.value !== 'procedure') {
            throw new Error(`Esperado 'procedure' no início da declaração de procedimento, encontrado: ${procToken ? procToken.value : 'EOF'} (linha ${procToken?.line}, coluna ${procToken?.column})`);
        }
        this.advance();

        const name = this.parseIdent();

        let params = [];
        const openParen = this.peek();
        if (openParen && openParen.type === 'PUNCTUATION' && openParen.value === '(') {
            this.advance();
            if (this.peek() && (this.peek().type !== 'PUNCTUATION' || this.peek().value !== ')')) {
                params = this.parseParamList();
            }
            const closeParen = this.peek();
            if (!closeParen || closeParen.type !== 'PUNCTUATION' || closeParen.value !== ')') {
                throw new Error(`Esperado ')' após lista de parâmetros, encontrado: ${closeParen ? closeParen.value : 'EOF'} (linha ${closeParen?.line}, coluna ${closeParen?.column})`);
            }
            this.advance();
        }

        const semicolon = this.peek();
        if (!semicolon || semicolon.type !== 'PUNCTUATION' || semicolon.value !== ';') {
            throw new Error(`Esperado ';' após cabeçalho do procedimento, encontrado: ${semicolon ? semicolon.value : 'EOF'} (linha ${semicolon?.line}, coluna ${semicolon?.column})`);
        }
        this.advance();

        const body = this.parseBlock();

        const endSemicolon = this.peek();
        if (!endSemicolon || endSemicolon.type !== 'PUNCTUATION' || endSemicolon.value !== ';') {
            throw new Error(`Esperado ';' após 'end' do procedimento, encontrado: ${endSemicolon ? endSemicolon.value : 'EOF'} (linha ${endSemicolon?.line}, coluna ${endSemicolon?.column})`);
        }
        this.advance();

        return {
            type: 'ProcedureDeclaration',
            name,
            params,
            body,
            line: procToken.line,
            column: procToken.column
        };
    }

    parseFunctionDeclaration() {
        // function <ident> ( <param-list> ) : <tipo> ; <bloco> ;
        const funcToken = this.peek();
        if (!funcToken || funcToken.type !== 'KEYWORD' || funcToken.value !== 'function') {
            throw new Error(`Esperado 'function' no início da declaração de função, encontrado: ${funcToken ? funcToken.value : 'EOF'} (linha ${funcToken?.line}, coluna ${funcToken?.column})`);
        }
        this.advance();

        const name = this.parseIdent();

        let params = [];
        const openParen = this.peek();
        if (!openParen || openParen.type !== 'PUNCTUATION' || openParen.value !== '(') {
            throw new Error(`Esperado '(' após nome da função, encontrado: ${openParen ? openParen.value : 'EOF'} (linha ${openParen?.line}, coluna ${openParen?.column})`);
        }
        this.advance();
        if (this.peek() && (this.peek().type !== 'PUNCTUATION' || this.peek().value !== ')')) {
            params = this.parseParamList();
        }
        const closeParen = this.peek();
        if (!closeParen || closeParen.type !== 'PUNCTUATION' || closeParen.value !== ')') {
            throw new Error(`Esperado ')' após lista de parâmetros, encontrado: ${closeParen ? closeParen.value : 'EOF'} (linha ${closeParen?.line}, coluna ${closeParen?.column})`);
        }
        this.advance();

        const colon = this.peek();
        if (!colon || colon.type !== 'PUNCTUATION' || colon.value !== ':') {
            throw new Error(`Esperado ':' após ')', encontrado: ${colon ? colon.value : 'EOF'} (linha ${colon?.line}, coluna ${colon?.column})`);
        }
        this.advance();
        const returnType = this.parseType();

        const semicolon = this.peek();
        if (!semicolon || semicolon.type !== 'PUNCTUATION' || semicolon.value !== ';') {
            throw new Error(`Esperado ';' após tipo de retorno, encontrado: ${semicolon ? semicolon.value : 'EOF'} (linha ${semicolon?.line}, coluna ${semicolon?.column})`);
        }
        this.advance();

        const body = this.parseBlock();

        const endSemicolon = this.peek();
        if (!endSemicolon || endSemicolon.type !== 'PUNCTUATION' || endSemicolon.value !== ';') {
            throw new Error(`Esperado ';' após 'end' da função, encontrado: ${endSemicolon ? endSemicolon.value : 'EOF'} (linha ${endSemicolon?.line}, coluna ${endSemicolon?.column})`);
        }
        this.advance();

        return {
            type: 'FunctionDeclaration',
            name,
            params,
            returnType: returnType.value,
            body,
            line: funcToken.line,
            column: funcToken.column
        };
    }

    parseParamList() {
        // <param-list> ::= <param> { ';' <param> }
        const params = [];
        params.push(this.parseParam());
        while (this.peek() && this.peek().type === 'PUNCTUATION' && this.peek().value === ';') {
            this.advance(); 
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
        else if (token.type === 'IDENTIFIER') {
            let ident = this.parseIdent();
            const next = this.peek();
            // '(' [ <expr-list> ]')'
            if (next && next.type === 'PUNCTUATION' && next.value === '(') {
                this.advance(); 

                let args = [];
                const lookahead = this.peek();
                if (lookahead && (lookahead.type !== 'PUNCTUATION' || lookahead.value !== ')')) {
                    args = this.parseExprList();
                }

                const closing = this.peek();
                if (!closing || closing.type !== 'PUNCTUATION' || closing.value !== ')') {
                    throw new Error(`Esperado ')' após chamada, encontrado: ${closing ? closing.value : 'EOF'} (linha ${closing?.line}, coluna ${closing?.column})`);
                }
                this.advance();

                return {
                    type: 'Call',
                    callee: ident,
                    arguments: args,
                    line: ident.line,
                    column: ident.column
                };
            }
            return ident;
        }
        // <number>
        else if (token.type === 'NUMBER') {
            return this.parseNumber();
        }
        // '(' <expr> ')'
        else if (token.type === 'PUNCTUATION' && token.value === '(') {
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
        else if (token.type === 'KEYWORD' && (token.value === 'true' || token.value === 'false')) {
            this.advance();
            return { type: 'Boolean', value: token.value === 'true', line: token.line, column: token.column };
        }
        // not <factor>
        else if (token.type === 'KEYWORD' && token.value === 'not') {
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
            this.advance(); 
            exprs.push(this.parseExpr());
        }
        return exprs;
    }

    parseStmtList() {
        const stmts = [];
        stmts.push(this.parseStmt());
        while (this.peek() && this.peek().type === 'PUNCTUATION' && this.peek().value === ';') {
            this.advance(); 
            stmts.push(this.parseStmt());
        }
        return { type: 'StmtList', statements: stmts };
    }

    parseStmt() {
        const token = this.peek();

        if (!token) throw new Error('Esperado comando, encontrado EOF');

        if (token.type === 'KEYWORD') {
            switch (token.value) {
                case 'if':
                    return this.parseIfStmt();
                case 'while':
                    return this.parseWhileStmt();
                case 'writeln':
                    return this.parseWriteStmt();
                case 'break':
                    return this.parseBreakStmt();
                case 'continue':
                    return this.parseContinueStmt();
                case 'return':
                    return this.parseReturnStmt();
            }
        }

        if (token.type === 'IDENTIFIER') {
            return this.parseAssignOrCall();
        }

        throw new Error(`Comando inválido: ${token.value} (linha ${token.line}, coluna ${token.column})`);
    }

    parseIfStmt() {
        const tokenIf = this.peek();
        this.advance(); 

        const expr = this.parseExpr();

        const thenToken = this.peek();
            if (!thenToken || thenToken.type !== 'KEYWORD' || thenToken.value !== 'then') {
                throw new Error(`Esperado 'then' após condição do if, encontrado: ${thenToken ? thenToken.value : 'EOF'} (linha ${thenToken?.line}, coluna ${thenToken?.column})`);
            }
        this.advance(); 

        const thenStmt = this.parseBlock();

        let elseStmt = null;
        const maybeElse = this.peek();
        if (maybeElse && maybeElse.type === 'KEYWORD' && maybeElse.value === 'else') {
            this.advance(); 
            elseStmt = this.parseBlock();
        }

        return {
            type: 'IfStmt',
            expr,
            thenBranch: thenStmt,
            elseBranch: elseStmt,
            line: tokenIf.line,
            column: tokenIf.column
        };
    }

    parseAssignOrCall() {
        const ident = this.parseIdent(); 

        const next = this.peek();

        if (next && next.type === 'OPERATOR' && next.value === ':=') {
            this.advance(); 
            const expr = this.parseExpr();
            return {
                type: 'Assign',
                target: ident,
                value: expr,
                line: ident.line,
                column: ident.column
            };
        }

        if (next && next.type === 'PUNCTUATION' && next.value === '(') {
            this.advance(); 

            let args = [];
            const lookahead = this.peek();
            if (lookahead && (lookahead.type !== 'PUNCTUATION' || lookahead.value !== ')')) {
                args = this.parseExprList();
            }

            const closing = this.peek();
            if (!closing || closing.type !== 'PUNCTUATION' || closing.value !== ')') {
                throw new Error(`Esperado ')' após chamada, encontrado: ${closing ? closing.value : 'EOF'} (linha ${closing?.line}, coluna ${closing?.column})`);
            }
            this.advance();

            return {
                type: 'Call',
                callee: ident,
                arguments: args,
                line: ident.line,
                column: ident.column
            };
        }

        throw new Error(`Esperado ':=' ou '(' após identificador, encontrado: ${next ? next.value : 'EOF'} (linha ${next?.line}, coluna ${next?.column})`);
    }  

    parseWhileStmt() {
        const tokenWhile = this.peek();
        this.advance(); 

        const expr = this.parseExpr();

        const doToken = this.peek();
            if (!doToken || doToken.type !== 'KEYWORD' || doToken.value !== 'do') {
                throw new Error(`Esperado 'do' após condição do while, encontrado: ${doToken ? doToken.value : 'EOF'} (linha ${doToken?.line}, coluna ${doToken?.column})`);
            }
        this.advance(); 

        const doStmt = this.parseBlock();
        return {
            type: 'WhileStmt',
            expr,
            doBranch: doStmt,
            line: tokenWhile.line,
            column: tokenWhile.column
        };
    }

    parseWriteStmt() {
        const writeToken = this.peek(); 
        console.log(writeToken);
        this.advance(); 

        const openParen = this.peek();
        if (!openParen || openParen.type !== 'PUNCTUATION' || openParen.value !== '(') {
            throw new Error(`Esperado '(' após 'writeln', encontrado: ${openParen ? openParen.value : 'EOF'} (linha ${openParen?.line}, coluna ${openParen?.column})`);
        }
        this.advance(); 

        let args = [];
        const lookahead = this.peek();
        if (lookahead && (lookahead.type !== 'PUNCTUATION' || lookahead.value !== ')')) {
            args = this.parseExprList(); 
        }

        const closing = this.peek();
        if (!closing || closing.type !== 'PUNCTUATION' || closing.value !== ')') {
            throw new Error(`Esperado ')' após argumentos do 'writeln', encontrado: ${closing ? closing.value : 'EOF'} (linha ${closing?.line}, coluna ${closing?.column})`);
        }
        this.advance(); 

        return {
            type: 'WriteStmt',
            arguments: args,
            line: writeToken.line,
            column: writeToken.column
        };
    }

    parseBreakStmt() {
        const token = this.peek();
        if (!token || token.type !== 'KEYWORD' || token.value !== 'break') {
            throw new Error(`Esperado 'break', encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
        }
        this.advance();
        return {
            type: 'BreakStmt',
            line: token.line,
            column: token.column
        };
    }

    parseContinueStmt() {
        const token = this.peek();
        if (!token || token.type !== 'KEYWORD' || token.value !== 'continue') {
            throw new Error(`Esperado 'continue', encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
        }
        this.advance();
        return {
            type: 'ContinueStmt',
            line: token.line,
            column: token.column
        };
    }

    parseReturnStmt() {
        const token = this.peek();
        if (!token || token.type !== 'KEYWORD' || token.value !== 'return') {
            throw new Error(`Esperado 'return', encontrado: ${token ? token.value : 'EOF'} (linha ${token?.line}, coluna ${token?.column})`);
        }
        this.advance();
        const expr = this.parseExpr();
        return {
            type: 'ReturnStmt',
            value: expr,
            line: token.line,
            column: token.column
        };
    }


    // Mantém parseVarDeclaration para compatibilidade, mas só consome 'var' e chama parseVarDeclarationSemVar
    parseVarDeclaration() {
        const varToken = this.peek();
        if (!varToken || varToken.type !== 'KEYWORD' || varToken.value !== 'var') {
            throw new Error(`Esperado 'var' no início da declaração de variável, encontrado: ${varToken ? varToken.value : 'EOF'} (linha ${varToken?.line}, coluna ${varToken?.column})`);
        }
        this.advance();
        return this.parseVarDeclarationSemVar();
    }
}

module.exports = TinyPascalParser;
