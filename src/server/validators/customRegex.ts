// regex to match variables
export const regVar = /[a-zA-Z][a-zA-Z0-9_]+/;
export const regNum = /\d+/;
// export const regOp = /[+/-*]/;
// export const regExpr = new RegExp(`(${regVar.source}|${regNum.source})(${regOp.source}(${regVar.source}|${regNum.source}))*`);
// export const regForLoop = new RegExp(`for\\s+${regVar.source}\\s*(=\\s*${regNum.source})?\\s+to\\s+${regNum.source}\\s+(step\\s+${regNum.source})?\\s+do`, 'i');
export const regDeclare = new RegExp(`declare\\s+(\\w+)\\s+as\\s+(\\w+)`, 'i');
export const regForLoop = new RegExp(`for (${regVar.source})(?:\\s*=)? *(?:(\\d+))? *to *(\\d+|[\\w]+)(?:\\s*step\\s*(\\d+))? *do`, 'i');


/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}