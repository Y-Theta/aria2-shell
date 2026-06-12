use serde_json::{json, Value};

pub struct Aria2Client {
    pub endpoint: String,
    pub token: Option<String>,
}

impl Aria2Client {
    pub fn new(endpoint: impl Into<String>, token: Option<String>) -> Self {
        Self {
            endpoint: endpoint.into(),
            token,
        }
    }

    pub fn build_rpc_payload(&self, method: &str, params: Vec<Value>) -> Value {
        let actual_params = if let Some(token) = &self.token {
            let mut p = vec![json!(format!("token:{token}"))];
            p.extend(params);
            p
        } else {
            params
        };

        json!({
            "jsonrpc": "2.0",
            "id": "downloader-ui",
            "method": method,
            "params": actual_params
        })
    }
}