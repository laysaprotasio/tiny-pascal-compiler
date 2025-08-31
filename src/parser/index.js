const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('./parser');
const {TinyPascalSemanticAnalyzer, SemanticError} = require('../semantics/semantic-analyzer');

const filePath = path.resolve(__dirname, '../../example.tp');
const exampleCode = fs.readFileSync(filePath, 'utf-8');

const lexer = new TinyPascalLexer(exampleCode);
const tokens = lexer.tokenize();

const parser = new TinyPascalParser(tokens);
const result = parser.parseProgram();

console.dir(result, { depth: null });

const analyzer = new TinyPascalSemanticAnalyzer();
const annotated = analyzer.analyzeProgram(result);

console.dir(annotated, { depth: null });
//console.log(analyzer.symbolTable);
console.log("Tabela final:");
console.log(JSON.stringify(analyzer.symbolTable, null, 2));

