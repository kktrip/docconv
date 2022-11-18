use crate::db::sqlite::Db;
use serde::{Serialize, Deserialize};
use sqlx::query_as;

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct Setting {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub param: String,
}

pub async fn get_setting() -> Result<Vec<Setting>, String> {
    let db = Db::new().await;
    let pool = db.0.clone();
    let setting_table = query_as::<_, Setting>("select * from setting")
        .fetch_all(&*pool)
        .await
        .ok();

    Ok(setting_table.unwrap())
}

pub async fn update_setting(setting_list: Vec<Setting>) -> Result<bool, String> {
    let db = Db::new().await;
    let pool = db.0.clone();
    for st in setting_list {
        sqlx::query("UPDATE setting SET param = ? WHERE name = ?")
            .bind(st.param)
            .bind(st.name)
            .execute(&*pool)
            .await;
    }
    Ok(true)
}

