# TinyPascal Analyzer

Projeto em Node.js que implementa um analisador léxico para a linguagem **TinyPascal**.

## Visão Geral

Este projeto fornece um analisador léxico (lexer) para a linguagem TinyPascal, capaz de identificar todos os tokens definidos pela gramática (BNF) da linguagem. O lexer pode ser utilizado tanto em testes automatizados quanto manualmente para analisar arquivos de código-fonte.

## Requisitos

* Node.js (versão 14+ recomendada)

## Instalação

```bash
git clone https://github.com/usuario/tiny-pascal-compiler.git
cd tiny-pascal-compiler
npm install
```

## Estrutura do Projeto

```
example.tp           # Exemplo de código TinyPascal
src/lexer/lexer.js   # Implementação principal do lexer
src/lexer/tokens.js  # Definição dos tipos de tokens, palavras-chave, operadores e pontuação
src/lexer/index.js   # Script para tokenizar manualmente um arquivo
src/tests/lexer.test.js # Testes automatizados do lexer
src/utils/helpers.js # (reservado para utilitários)
```

## Tipos de Tokens Reconhecidos

- **KEYWORD**: Palavras-chave da linguagem (ex: `var`, `begin`, `end`, `if`, `then`, `else`, `while`, `do`, `function`, `procedure`, `writeln`, `break`, `continue`, `return`, `true`, `false`, `not`, `and`, `or`)
- **IDENTIFIER**: Identificadores válidos (ex: `x`, `soma`, `imprimeResultado`)
- **NUMBER**: Números inteiros (ex: `123`, `0`)
- **STRING**: Strings delimitadas por aspas simples (ex: `'texto'`)
- **OPERATOR**: Operadores (`:=`, `+`, `-`, `*`, `/`, `=`, `<>`, `<`, `>`, `<=`, `>=`)
- **PUNCTUATION**: Pontuação (`;`, `,`, `.`, `(`, `)`, `:`)
- **EOF**: Fim do arquivo
- **UNKNOWN**: Qualquer caractere não reconhecido pela gramática

## Exemplo de Código TinyPascal

Veja o arquivo `example.tp` para um exemplo completo. Trecho:

```pascal
var
  x, y: integer;
  msg: boolean;

function soma(a: integer; b: integer): integer;
begin
  return a + b;
end;

begin
  x := 10;
  y := 20;
  msg := true;
  if x < y then
    x := soma(x, y)
  else
    x := 0;
  while x > 0 do
  begin
    x := x - 1;
    writeln(x);
  end;
end.
```

## Uso Manual (Visualizar Tokens)

Para visualizar os tokens de um arquivo TinyPascal (ex: `example.tp`), execute:

```bash
node src/lexer/index.js
```

Saída esperada (exemplo):
```
[KEYWORD] (1,1): var
[IDENTIFIER] (2,3): x
[PUNCTUATION] (2,4): ,
...
[EOF] (34,5): null
```

## Testes Automatizados

Para rodar todos os testes automatizados do lexer:

```bash
npm test
```

Os testes cobrem todos os casos da BNF da linguagem, incluindo:
- Identificadores, palavras-chave, números, strings, operadores, pontuação, EOF e caracteres desconhecidos
- Exemplos completos de declarações, comandos, expressões e controle de fluxo

## Referência

- A gramática (BNF) da linguagem TinyPascal está disponível nas imagens do repositório ou documentação do projeto.
- O arquivo `example.tp` serve como referência de código válido para testes.

---

Sinta-se à vontade para contribuir ou abrir issues para dúvidas e melhorias!

