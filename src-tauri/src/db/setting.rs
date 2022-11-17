use crate::db::sqlite::Db;
use sqlx::query_as;

#[derive(Debug, sqlx::FromRow)]
pub struct Setting {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub param: String,
}

pub async fn find_by_name() -> anyhow::Result<Option<Vec<Setting>>> {
    let db = Db::new().await;
    let pool = db.0.clone();
    let setting_table = query_as::<_, Setting>("select * from setting")
        .fetch_all(&*pool)
        .await
        .ok();
    match setting_table {
        Some(st)) => Ok(Some(st.try_into()?)),
        None => Ok(None),
    }
}
