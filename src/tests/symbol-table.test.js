const SymbolTable = require('../semantics/symbol-table');

describe('SymbolTable', () => {
    let table;

    beforeEach(() => {
        table = new SymbolTable();
    });

    test('declara e busca símbolo no escopo global', () => {
        table.declareSymbol('x', { type: 'integer', category: 'variable' });
        expect(table.lookupSymbol('x')).toEqual({ type: 'integer', category: 'variable' });
    });

    test('não permite redeclaração no mesmo escopo', () => {
        table.declareSymbol('x', { type: 'integer', category: 'variable' });
        expect(() => table.declareSymbol('x', { type: 'real', category: 'variable' })).toThrow();
    });

    test('escopo interno sobrescreve símbolo', () => {
        table.declareSymbol('x', { type: 'integer', category: 'variable' });
        table.enterScope();
        table.declareSymbol('x', { type: 'real', category: 'variable' });
        expect(table.lookupSymbol('x')).toEqual({ type: 'real', category: 'variable' });
        table.exitScope();
        expect(table.lookupSymbol('x')).toEqual({ type: 'integer', category: 'variable' });
    });

    test('símbolo de escopo interno não existe após sair do escopo', () => {
        table.enterScope();
        table.declareSymbol('y', { type: 'real', category: 'variable' });
        expect(table.lookupSymbol('y')).toEqual({ type: 'real', category: 'variable' });
        table.exitScope();
        expect(table.lookupSymbol('y')).toBeNull();
    });

    test('atualiza símbolo existente', () => {
        table.declareSymbol('x', { type: 'integer', category: 'variable' });
        table.updateSymbol('x', { value: 42 });
        expect(table.lookupSymbol('x')).toEqual({ type: 'integer', category: 'variable', value: 42 });
    });

    test('lança erro ao atualizar símbolo inexistente', () => {
        expect(() => table.updateSymbol('z', { value: 10 })).toThrow();
    });
});
