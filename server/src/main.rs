use regex::Regex;
use tower_lsp::{jsonrpc::Result, lsp_types::*, Client, LanguageServer, LspService, Server};

#[derive(Debug)]
struct Backend {
    client: Client,
    // hasConfigurationCapability: bool,
    // hasWorkspaceFolderCapability: bool,
    // hasDiagnosticRelatedInformationCapability: bool,
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> Result<InitializeResult> {
        let capabilities = ServerCapabilities {
            text_document_sync: Some(TextDocumentSyncCapability::Options(
                TextDocumentSyncOptions {
                    open_close: Some(true),
                    change: Some(TextDocumentSyncKind::INCREMENTAL),
                    will_save: Some(false),
                    will_save_wait_until: Some(false),
                    ..TextDocumentSyncOptions::default()
                },
            )),
            completion_provider: Some(CompletionOptions {
                resolve_provider: Some(true),
                trigger_characters: Some(vec![".".to_string()]),
                ..CompletionOptions::default()
            }),
            diagnostic_provider: Some(DiagnosticServerCapabilities::Options(DiagnosticOptions {
                inter_file_dependencies: false,
                workspace_diagnostics: false,
                ..DiagnosticOptions::default()
            })),
            ..ServerCapabilities::default()
        };
        let result = InitializeResult {
            capabilities,
            ..InitializeResult::default()
        };
        Ok(result)
    }
    async fn initialized(&self, _: InitializedParams) {
        self.client
            .log_message(MessageType::INFO, "server initialized")
            .await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn completion(&self, _: CompletionParams) -> Result<Option<CompletionResponse>> {
        Ok(Some(CompletionResponse::Array(vec![
            CompletionItem {
                label: "Hello".to_string(),
                kind: Some(CompletionItemKind::TEXT),
                detail: Some("Some detail".to_string()),
                ..CompletionItem::default()
            },
            CompletionItem {
                label: "Bye".to_string(),
                kind: Some(CompletionItemKind::TEXT),
                detail: Some("Some detail".to_string()),
                ..CompletionItem::default()
            },
        ])))
    }
    async fn hover(&self, _: HoverParams) -> Result<Option<Hover>> {
        Ok(Some(Hover {
            contents: HoverContents::Scalar(MarkedString::String("You're hovering!".to_string())),
            range: None,
        }))
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        let uri = params.text_document.uri;
        let max_problems = 10;

        let text = params.content_changes[0].text.clone();
        let pattern = Regex::new(r"\b[A-Z]{2,}\b").unwrap();

        let mut problems = 0;
        let mut diagnostics = Vec::new();
        for cap in pattern.captures_iter(&text) {
            if problems >= max_problems {
                break;
            }

            problems += 1;

            let start = Position::new(cap.get(0).unwrap().start() as u32, 0);
            let end = Position::new(cap.get(0).unwrap().end() as u32, 0);
            let range = Range::new(start, end);

            let diagnostic = Diagnostic {
                range,
                severity: Some(DiagnosticSeverity::WARNING),
                message: format!("{} is all uppercase", &cap[0]),
                source: Some("ex".to_string()),
                related_information: Some(vec![
                    DiagnosticRelatedInformation {
                        location: Location {
                            uri: uri.clone(),
                            range,
                        },
                        message: "Spelling matters".to_string(),
                    },
                    DiagnosticRelatedInformation {
                        location: Location {
                            uri: uri.clone(),
                            range,
                        },
                        message: "Particularly for names".to_string(),
                    },
                ]),
                ..Diagnostic::default()
            };

            diagnostics.push(diagnostic);
        }

        self.client
            .publish_diagnostics(uri, diagnostics, None)
            .await;
    }
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(|client| Backend { client });
    Server::new(stdin, stdout, socket).serve(service).await;
}
