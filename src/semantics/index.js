const fs = require('fs');
const path = require('path');
const TinyPascalLexer = require('../lexer/lexer');
const TinyPascalParser = require('../parser/parser');
const { TinyPascalSemanticAnalyzer, SemanticError } = require('./semantic-analyzer');

// Uso: node src/semantics/index.js [caminho/do/arquivo.tp]
// Se nenhum caminho for passado, usa example.tp na raiz do projeto.

function main() {
  const inputArg = process.argv[2];
  const filePath = inputArg
    ? path.resolve(process.cwd(), inputArg)
    : path.resolve(__dirname, '../../example.tp');

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const code = fs.readFileSync(filePath, 'utf-8');

  try {
    const lexer = new TinyPascalLexer(code);
    const tokens = lexer.tokenize();

    const parser = new TinyPascalParser(tokens);
    const ast = parser.parseProgram();

    console.log('=== Fonte ===');
    console.log(filePath);
    console.log('\n=== AST ===');
    console.dir(ast, { depth: null });

    const analyzer = new TinyPascalSemanticAnalyzer();
    const annotated = analyzer.analyzeProgram(ast);

    console.log('\nAST Anotado (semântica):');
    console.dir(annotated, { depth: null });

    console.log('\nTabela de Símbolos Final:');
    console.log(JSON.stringify(analyzer.symbolTable, null, 2));

  } catch (e) {
    if (e instanceof SemanticError || e.name === 'SemanticError') {
      console.error(`Erro semântico: ${e.message}`);
    } else {
      console.error(`Erro: ${e.message}`);
    }
    process.exit(1);
  }
}

main();

