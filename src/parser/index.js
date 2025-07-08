const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('./parser');

const filePath = path.resolve(__dirname, '../../example.tp');
const sourceCode = fs.readFileSync(filePath, 'utf-8');
const lexer = new TinyPascalLexer(sourceCode);
const tokens = lexer.tokenize();
const parser = new TinyPascalParser(tokens, lexer.symbolTable);

try {
    const ast = parser.parseProgram();
    console.log('AST gerada com sucesso:');
    console.dir(ast, { depth: null });
} catch (err) {
    console.error('Erro de análise sintática:');
    console.error(err.message);
}
