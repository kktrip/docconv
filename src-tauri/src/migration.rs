use crate::db::sqlite::Db;

pub async fn migration() {
    let db = Db::new().await;
    let pool = db.0.clone();

    let sqls = get_migration_sqls();
    for sql in sqls.iter() {
        sqlx::query(sql).execute(&*pool).await.unwrap();
    }
}

#[cfg(test)]
pub fn migration_sync(db: Db) {
    use tauri::async_runtime::block_on;

    let pool = db.0.clone();

    let sqls = get_migration_sqls();
    for sql in sqls.iter() {
        block_on(sqlx::query(sql).execute(&*pool)).unwrap();
    }
}

fn get_migration_sqls() -> Vec<String> {
    let setting = "
    CREATE TABLE IF NOT EXISTS setting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        param TEXT
    );".to_string();

    let name_index =
        "CREATE INDEX IF NOT EXISTS name_index ON setting(name);".to_string();

    let insert_setting = format!("
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(1, \"ファイル判定条件1 セル位置\", \"経費精算表のファイルを判定するための文字が記入されたセルの位置\", \"A1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(2, \"ファイル判定条件1 文字\", \"経費精算表のファイルを判定するための文字\", \"経費精算表\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(3, \"ファイル判定条件2 セル位置\", \"経費精算表のファイルを判定するための文字が記入されたセルの位置\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(4, \"ファイル判定条件2 文字\", \"経費精算表のファイルを判定するための文字\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(5, \"ファイル判定条件3 セル位置\", \"経費精算表のファイルを判定するための文字が記入されたセルの位置\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(6, \"ファイル判定条件3 文字\", \"経費精算表のファイルを判定するための文字\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(7, \"読み取り最大行数\", \"経費精算の読み取り対象行の最大値\", \"100\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(8, \"読み取り終了条件 列番号\", \"経費精算の読み取り終了を判定する文字列が記入されたセルの列番号\", \"1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(9, \"読み取り終了条件 文字\", \"経費精算の読み取り終了を判定する文字列\", \"合計\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(10, \"勘定科目数\", \"勘定科目の数\", \"10\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(11, \"消費税率\", \"適用する消費税率\", \"0.1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(12, \"CSVファイル名のプレフィックス\", \"出力されたCSVファイルの頭に付与する文言\", \"convert_\");
        ");

    return vec![
        setting,
        name_index,
        insert_setting,
    ];
}
