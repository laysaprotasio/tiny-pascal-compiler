class SymbolTable {
    constructor() {
        this.scopes = [{}];
    }

    enterScope() {
        this.scopes.push({});
    }

    exitScope() {
        this.scopes.pop();
    }

    declareSymbol(name, info) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (currentScope[name]) {
            throw new Error(`Símbolo '${name}' já declarado neste escopo.`);
        }
        currentScope[name] = info;
    }

    lookupSymbol(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i][name]) {
                return this.scopes[i][name];
            }
        }
        return null;
    }

    updateSymbol(name, newInfo) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i][name]) {
                this.scopes[i][name] = { ...this.scopes[i][name], ...newInfo };
                return;
            }
        }
        throw new Error(`Símbolo '${name}' não encontrado para atualização.`);
    }
}

// Exemplo de uso:
// const table = new SymbolTable();
// table.declareSymbol('x', { type: 'integer', category: 'variable' });
// table.enterScope();
// table.declareSymbol('y', { type: 'real', category: 'variable' });
// console.log(table.lookupSymbol('x')); // { type: 'integer', category: 'variable' }
// table.exitScope();
// console.log(table.lookupSymbol('y')); // null

module.exports = SymbolTable;
