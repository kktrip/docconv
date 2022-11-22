use crate::db::sqlite::Db;

pub async fn migration() {
    let db = Db::new().await;
    let pool = db.0.clone();

    let sqls = get_migration_sqls();
    for sql in sqls.iter() {
        sqlx::query(sql).execute(&*pool).await.unwrap();
    }
}

fn get_migration_sqls() -> Vec<String> {
    let setting = "
    CREATE TABLE IF NOT EXISTS setting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        param TEXT
    );"
    .to_string();

    let name_index = "CREATE INDEX IF NOT EXISTS name_index ON setting(name);".to_string();

    let insert_setting = format!("
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(1, \"ファイル判定条件1 セル行番号\", \"経費精算表シート判定対象セルの行番号\", \"1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(2, \"ファイル判定条件1 セル列番号\", \"経費精算表シート判定対象セルの列番号\", \"1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(3, \"ファイル判定条件1 文字\", \"経費精算表シートを判定する文字\", \"経費精算表\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(4, \"ファイル判定条件2 セル行番号\", \"経費精算表シート判定対象セルの行番号\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(5, \"ファイル判定条件2 セル列番号\", \"経費精算表シート判定対象セルの列番号\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(6, \"ファイル判定条件2 文字\", \"経費精算表シートを判定する文字\", \"\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(7, \"読み取り開始行\", \"経費精算表シートの読み取り開始行\", \"6\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(8, \"読み取り開始列\", \"経費精算表シートの読み取り開始行\", \"1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(9, \"読み取り最大行数\", \"経費精算表シートの読み取り対象行の最大値\", \"100\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(10, \"読み取り最大列数\", \"経費精算表シートの読み取り終了を判定するセルの列番号\", \"1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(11, \"読み取り終了条件 文字\", \"経費精算表シートの読み取り終了を判定する文字列\", \"合計\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(12, \"消費税率\", \"適用する消費税率\", \"0.1\");
        INSERT OR IGNORE INTO setting(id, name, description, param) VALUES(13, \"CSVファイル名のプレフィックス\", \"出力されたCSVファイルの頭に付与する文字列\", \"convert_\");
        ");

    return vec![setting, name_index, insert_setting];
}
