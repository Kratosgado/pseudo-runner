import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
    DocumentDiagnosticReportKind,
    type DocumentDiagnosticReport,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { KEYWORDS } from './keywords';
import { validateDeclare,validateForLoop, validateWhile, validateAssignment, validateIfElse } from './validators';



const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: true
            },
            diagnosticProvider: {
                interFileDependencies: false,
                workspaceDiagnostics: false
            }
        }
    };
    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
});
interface PseudoSettings {
    maxNumberOfProblems: number;
}
const defaultSettings: PseudoSettings = { maxNumberOfProblems: 100 };
let globalSettings: PseudoSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<PseudoSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = <PseudoSettings>(
            (change.settings.pseudoRunner || defaultSettings)
        );
    }
    connection.languages.diagnostics.refresh();
});

function getDocumentSettings(resource: string): Thenable<PseudoSettings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'pseudoRunner'
        });
        documentSettings.set(resource, result);
    }
    return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});


connection.languages.diagnostics.on(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (document !== undefined) {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: await validateTextDocument(document)
        } satisfies DocumentDiagnosticReport;
    } else {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: []
        } satisfies DocumentDiagnosticReport;
    }
});

documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
    // In this simple example we get the settings for every validate run.
    const settings = await getDocumentSettings(textDocument.uri);

    const text = textDocument.getText();
    let m: RegExpExecArray | null;

    const lines = text.split(/\r?\n/);
    let problems = 0;
    const diagnostics: Diagnostic[] = [];
    const closingDiagnostics: Diagnostic[] = [];
    lines.map((line, i) => {
        line = line.trim().toLowerCase();
        if (line.trim().toLowerCase().startsWith("declare")) {
            validateDeclare(line, i).then((diagnostic) => {
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            });
        }
        if (line.startsWith("if")) {
            closingDiagnostics.push(expectEndKeyword(i, "endif"));
            validateIfElse(line, i).then(diagnostic => {
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            });
        }
        if (line.match(/[A-Za-z_]+\s+=/)) {

            validateAssignment(line, i).then((diagnostic) => {
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            });
        }
        if (line.startsWith("while")) {
            // add debugger error for endwhile keyword
            closingDiagnostics.push(expectEndKeyword(i, "endwhile"));
            validateWhile(line, i).then((diagnostic) => {
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            });
        }
        if (line.startsWith("function")) {
            closingDiagnostics.push(expectEndKeyword(i, "endfunction"));
        }
        
        // debug for end keywords
        if (line.match("endwhile")) {
            closingDiagnostics.pop();
        }
        if (line.match("endfor")) {
            closingDiagnostics.pop();
        }
        if (line.match("endif")) {
            closingDiagnostics.pop();
        }
        if (line.match("endfunction")) {
            closingDiagnostics.pop();
        }
        if (line.startsWith("for")) {
            // add debugger error for endwhile keyword
            closingDiagnostics.push(expectEndKeyword(i, "endfor"));
            validateForLoop(line, i).then((diagnostic) => {
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            });
        }
    });
    diagnostics.push(...closingDiagnostics);

    return diagnostics;
}

connection.onDidChangeWatchedFiles(_change => {
    connection.console.log('We received a file change event');
});

connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {

        let completions: CompletionItem[] = KEYWORDS.map((keyword) => {
            return {
                label: keyword.toUpperCase(),
                kind: CompletionItemKind.Keyword,
                detail: "pseudo keyword",
            };
        });
        return completions;
    }
);

connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        if (item.data === 1) {
            item.detail = 'TypeScript details';
            item.documentation = 'TypeScript documentation';
        } else if (item.data === 2) {
            item.detail = 'JavaScript details';
            item.documentation = 'JavaScript documentation';
        }
        return item;
    }
);
documents.listen(connection);
connection.listen();

// function to validate while loops

const expectEndKeyword = (lineNum: number, keyword: string): Diagnostic => {
    return {
        severity: DiagnosticSeverity.Error,
        range: {
            start: { line: lineNum, character: 0 },
            end: { line: lineNum, character: keyword.length }
        },
        message: `expecting keyword ${keyword} for line: ${lineNum + 1}`
    };
};