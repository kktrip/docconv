use std::{fs, path::Path, sync::Arc};

use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use tauri::{api::path::app_config_dir, Config};

#[derive(Clone)]
pub struct Db(pub(crate) Arc<Pool<Sqlite>>);

impl Db {
    pub async fn new() -> Db {
        let db_filename;
        let root = app_config_dir(&Config::default());

        match root {
            Some(root) => {
                fs::create_dir_all(
                    &root
                        .join(Path::new("docconv"))
                        .as_path()
                        .to_str()
                        .unwrap()
                        .to_string(),
                )
                .unwrap();
                db_filename = root
                    .join(Path::new("docconv"))
                    .join(Path::new("docconv_sqlite.db3"))
                    .as_path()
                    .to_str()
                    .unwrap()
                    .to_string()
            }
            None => {
                fs::create_dir_all("docconv").unwrap();
                db_filename = "docconv/docconv_sqlite.db3".to_string()
            }
        }
        let pool = SqlitePoolOptions::new()
            .max_connections(256)
            .connect(&format!("sqlite://{}?mode=rwc", db_filename))
            .await
            .map_err(|err| format!("{}\nfile: {}", err.to_string(), db_filename))
            .unwrap();

        Db(Arc::new(pool))
    }
}
