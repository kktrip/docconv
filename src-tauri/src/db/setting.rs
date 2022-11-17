use crate::db::sqlite::Db;
use serde::Serialize;
use sqlx::query_as;

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct Setting {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub param: String,
}

pub async fn find_by_name() -> Result<Vec<Setting>, String> {
    let db = Db::new().await;
    let pool = db.0.clone();
    let setting_table = query_as::<_, Setting>("select * from setting")
        .fetch_all(&*pool)
        .await
        .ok();

    Ok(setting_table.unwrap())
}
