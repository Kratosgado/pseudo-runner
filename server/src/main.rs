use lsp_server::{
    Connection,
    Message,
    Notification,
    Request,
    Response
};
use lsp_types::{
    CompletionItem, CompletionList, 
    CompletionParams,
    DidChangeTextDocumentParams,
    InitializeParams, ServerCapabilities, TextDocumentSyncCapability,
    TextDocumentSyncKind
};

fn main() {
    // initialize the connection to the client
    let (connection, _ ) = Connection::stdio();

    // create a new language server instance
    let mut server = 
    println!("Hello, world!");
}

struct PseudocodeLanguageServer {

}

impl PseudocodeLanguageServer {
    fn new() -> Self {
        PseudocodeLanguageServer {}
    }

    fn on_initialize(&mut self, params: InitializeParams){
        unimplemented!()
    }

    fn on_text_document_did_change(&mut self, params: DidChangeTextDocumentParams){
        unimplemented!()
    }

    fn on_completed(&mut self, params: CompletionParams) -> CompletionList {
        // handle completion requests
        let completion_items = vec![
            CompletionItem{
                label: "if".to_string(),
                kind: Some(lsp_types::CompletionItemKind::KEYWORD),
                ..Default::default()
            }
        ];
        CompletionList {
            is_incomplete: false,
            items: completion_items,
        }
    }
}

// run the server
impl lsp_types::Server {
    
}