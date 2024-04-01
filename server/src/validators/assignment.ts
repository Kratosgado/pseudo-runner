import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

export async function validateAssignment(line: string, i: number): Promise<Diagnostic | null> {
    // Check for correct syntax: <variable_name> = <expression>
    const match = line.match(/(\w+)\s*=\s*(.*)/);
    if (!match) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: i, character: 0 },
                end: { line: i, character: line.length }
            },
            message: `Invalid variable assignment syntax at line ${i + 1}`
        };
    }
    const [__, variableName, expression] = match;

    // Ensure that the variable name matches the expected pattern
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

    // Perform further validation on the expression, e.g., ensuring that it follows the syntax of a valid literal or subexpression
    // ...

    return null;
}

/**
 * Returns whether the given identifier matches the expected syntax for a valid variable name.
 */
function validateIdentifierSyntax(identifier: string): boolean {
    return /^[_A-Za-z][_\w]*$/.test(identifier);
}