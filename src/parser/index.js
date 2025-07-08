const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('./parser');

const filePath = path.resolve(__dirname, '../../example.tp');
const exampleCode = fs.readFileSync(filePath, 'utf-8');

const lexer = new TinyPascalLexer(exampleCode);
const tokens = lexer.tokenize();

const parser = new TinyPascalParser(tokens);
const result = parser.parseProgram();

console.dir(result, { depth: null });
