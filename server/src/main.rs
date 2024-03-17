use tower_lsp::{jsonrpc::Result, lsp_types::*, Client, LanguageServer, LspService, Server};

#[derive(Debug)]
struct Backend {
    client: Client,
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> Result<InitializeResult> {
        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Options(
                    TextDocumentSyncOptions {
                        open_close: Some(true),
                        change: Some(TextDocumentSyncKind::FULL),
                        ..TextDocumentSyncOptions::default()
                    },
                )),
                completion_provider: Some(CompletionOptions {
                    resolve_provider: Some(true),
                    trigger_characters: Some(vec![".".to_string()]),
                    ..CompletionOptions::default()
                }),
                ..ServerCapabilities::default()
            },
            server_info: None,
        })
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
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(|client| Backend { client });
    Server::new(stdin, stdout, socket).serve(service).await;
}
