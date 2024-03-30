// regex to match variables
const regVar = /[a-zA-Z][a-zA-Z0-9_]+/;
const regNum = /\d+/;
const regOp = /[+/-*]/;
const regExpr = new RegExp(`(${regVar.source}|${regNum.source})(${regOp.source}(${regVar.source}|${regNum.source}))*`);


export {
    regExpr, regNum, regOp, regVar,
    validateIdentifierSyntax,
};

/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}