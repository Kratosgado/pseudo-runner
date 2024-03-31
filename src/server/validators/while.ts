import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";


export async function validateWhile(line: string, i: number): Promise<Diagnostic | null> {
    // Check for correct syntax: for <variable><optional = <start>> to <end> <optional<step> <value>> do
    const match = line.match(/while (\w+)(?:\s*(>|<|>=|<=|==))? *(?:(\d+|\w+|[\w+(+|-|*|/)\d+]))? *do/i);
    if (!match) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: 0 },
                end: { line: i, character: line.length }
            },
            message: `Invalid while loop syntax at line ${i + 1}`
        };
    }
    const [__, variableName, startValue, endValue, stepValue] = match;

    // Ensure that the variable name matches the expected syntax for a valid variable name
    if (!validateIdentifierSyntax(variableName)) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: 0 },
                end: { line: i, character: variableName.length }
            },
            message: `Invalid variable name "${variableName}" at line ${i + 1}`
        };
    }

    // Return null if no issues were encountered during validation
    return null;
}

/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}