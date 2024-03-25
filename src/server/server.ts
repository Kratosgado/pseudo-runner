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
import { Position } from 'vscode';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
// let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
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

// The example settings
interface PseudoSettings {
    maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
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
    // Refresh the diagnostics since the `maxNumberOfProblems` could have changed.
    // We could optimize things here and re-fetch the setting first can compare it
    // to the existing setting, but this is out of scope for this example.
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
        // We don't know the document. We can either try to read it from disk
        // or we don't report problems for it.
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: []
        } satisfies DocumentDiagnosticReport;
    }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
    // In this simple example we get the settings for every validate run.
    const settings = await getDocumentSettings(textDocument.uri);

    // The validator creates diagnostics for all uppercase words length 2 and more
    const text = textDocument.getText();
    const pattern = /\b[A-Z]{2,}\b/g;
    let m: RegExpExecArray | null;

    const lines = text.split(/\r?\n/);
    let problems = 0;
    const diagnostics: Diagnostic[] = [];
    lines.map((line, i) => {
        if (line.trim().toLowerCase().startsWith("declare")) {
            validateDeclare(textDocument, line, i).then((diagnostic) => {
                if (diagnostic) {
                    diagnostics.push(diagnostic);
                }
            });
        }
    });

    diagnostics.push((await validateForLoop(lines))[0]);

    return diagnostics;
}

connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received a file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        // The pass parameter contains the position of the text document in
        // which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
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

// This handler resolves additional information for the item selected in
// the completion list.
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

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

async function validateForLoop(lines: string[]): Promise<Diagnostic[]> {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().toLowerCase().startsWith("for")) {
            // Check for correct syntax: for <variable> = <start> to <end> step <stepsize> do
            const match = line.toLowerCase().match(/for\s+(\w+)\s*=\s*(\d+)\s+to\s+(\d+)\s+step\s+(\d+)\s+do/i);
            if (!match) {
                return [{
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: line.length }
                    },
                    message: "Syntax error in for loop",
                    source: "pseudoRunner"
                }];
            }
        }
    }
    return [];
}

async function validateDeclare(textDocument: TextDocument, line: string, i: number): Promise<Diagnostic | null> {
    // Check for correct syntax: declare <variable> as <type>
    const match = line.toLowerCase().match(/declare\s+(\w+)\s+as\s+(\w+)/i);
    if (!match) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(textDocument.offsetAt({ line: i, character: 0 }) + 7),
                end: textDocument.positionAt(textDocument.offsetAt({ line: i, character: 0 }) + 7 + line.length)
            },
            message: `Invalid declare statement syntax at line ${i + 1}`
        };
    }
    const [_, variable, datatype] = match;
    if (variable === null || datatype === null) {
        return {
            severity: DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(i + 7),
                end: textDocument.positionAt(i)
            },
            message: `Variable name required for declare statement at line ${i + 1}`
        };
    }
    // if (!["INTEGER", "STRING", "DOUBLE"].includes(datatype.toUpperCase())) {
    //     return {
    //         severity: DiagnosticSeverity.Error,
    //         range: {
    //             start: new Position(i, datatype.length + 10),
    //             end: new Position(i, datatype.length + 10),
    //         },
    //         message: `Invalid datatype "${datatype}" for declare statement at line ${i + 1}. Must be one of INTEGER, STRING, DOUBLE.`
    //     };
    // }
    return null;
}