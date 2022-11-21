use crate::db::setting;
use crate::db::setting::Setting;
use calamine::DataType;
use calamine::{open_workbook, Reader, Xlsx};
use chrono::prelude::Local;
use chrono::Duration;
use chrono::TimeZone;
use tauri::async_runtime::block_on;

#[tauri::command]
pub fn read_sheets(filepath: &str) -> Vec<String> {
    let mut vec = Vec::<String>::new();
    let wb: Xlsx<_> = open_workbook(filepath).expect("Cannot Open Excel Book");
    let sheets = wb.sheet_names().to_owned();
    for s in sheets {
        vec.push(s);
    }
    return vec;
}

#[tauri::command]
pub fn read_values(filepath: &str, sheetname: &str) -> Vec<Vec<String>> {
    let mut wb: Xlsx<_> = open_workbook(filepath).expect("Cannot Open Excel Book");

    // 経費一覧
    let mut exp_list = Vec::new();
    // シート内の値を取得していく
    let range = wb.worksheet_range(&sheetname).unwrap().unwrap();

    // 設定読み取り
    let setting = get_setting().unwrap();
    let st_file_exist_cell_range_1 = &setting[0].param;
    let st_file_exist_str_1 = &setting[1].param;
    let st_file_exist_cell_range_2 = &setting[2].param;
    let st_file_exist_str_2 = &setting[3].param;
    let st_file_exist_cell_range_3 = &setting[4].param;
    let st_file_exist_str_3 = &setting[5].param;
    let st_read_start_row = &setting[6].param;
    let st_read_max_row = &setting[7].param;
    let st_read_end_col = &setting[8].param;
    let st_read_end_str = &setting[9].param;
    let st_account_cnt = &setting[10].param;
    let st_tax_rate = &setting[11].param;

    // 各行の値読み込み
    let start_row: u32 = 5;
    let max_row = range.get_size().0 as u32;
    let empty = &DataType::Empty;
    for row in start_row..max_row {
        let cell_val = range.get_value((row, 0)).unwrap_or(empty).to_string();
        if cell_val.is_empty() || cell_val.contains(st_read_end_str) {
            break;
        }

        // 各行ごとのリスト
        let mut row_list = Vec::new();

        // 識別フラグ(A)
        row_list.push("2000".to_string());

        // 伝票No(B)
        row_list.push("".to_string());

        // 決算(C)
        row_list.push("".to_string());

        // 取引日付(D)
        let tmp_date_val = range.get_value((row, 0)).unwrap_or(empty);
        let local = Local.with_ymd_and_hms(1900, 1, 1, 0, 0, 0).unwrap();
        let offset = Duration::days(tmp_date_val.to_string().parse().unwrap_or(0) - 2);
        let date_val = local + offset;
        // yyyyMMdd形式に変換したい。。。
        row_list.push(date_val.to_string()[0..10].replace("-", "/").to_string());

        // 借方金額記入位置の取得
        let mut dev_cost_col = 0;
        for col in 1..9 {
            let tmp_dev_cost = range.get_value((row, col)).unwrap_or(empty);
            // 経費がいずれかの勘定項目列に記入されているか？
            if !tmp_dev_cost.is_empty() {
                dev_cost_col = col;
                break;
            }
        }

        // 借方勘定科目(E)
        let deb_acc_val = range.get_value((4, dev_cost_col)).unwrap_or(empty);
        row_list.push(deb_acc_val.to_string());

        // 借方補助科目(F)
        row_list.push("".to_string());

        // 借方部門(G)
        row_list.push("".to_string());

        // 借方税区分(H)
        row_list.push("対象外".to_string());

        // 借方金額(I) ※税込
        let deb_cost_val = range.get_value((row, dev_cost_col)).unwrap_or(empty);
        row_list.push(deb_cost_val.to_string());

        // 借方税金額(J)
        let tax_rate = 0.1;
        let deb_cost_num = deb_cost_val.to_string().parse().unwrap_or(0.0);
        let deb_tax_num = deb_cost_num / 1.0 + tax_rate;
        let deb_tax_val = deb_tax_num.to_string();
        row_list.push(deb_tax_val.to_string());

        // 貸方勘定科目(K)
        row_list.push("".to_string());

        // 貸方補助科目(L)
        row_list.push("".to_string());

        // 貸方部門(M)
        row_list.push("".to_string());

        // 貸方税区分(N)
        row_list.push("対象外".to_string());

        // 貸方金額(O) ※税込　※借方金額と同じにしている
        let cre_cost_val = range.get_value((row, dev_cost_col)).unwrap_or(empty);
        row_list.push(cre_cost_val.to_string());

        // 貸方税金額(P) ※借方税金額と同じにしている
        row_list.push(deb_tax_val.to_string());

        // 摘要(Q)
        let sum_val = range.get_value((row, 10)).unwrap_or(empty);
        row_list.push(sum_val.to_string());

        // 番号(R)
        row_list.push("".to_string());

        // 期日(S)
        row_list.push("".to_string());

        // タイプ(T)
        row_list.push("".to_string());

        // 生成元(U)
        row_list.push("".to_string());

        // 仕訳メモ(V)
        row_list.push("".to_string());

        // 付箋1(W)
        row_list.push("".to_string());

        // 付箋2(X)
        row_list.push("".to_string());

        // 調整(Y)
        row_list.push("no".to_string());

        // 借方取引先名(Z)
        row_list.push("".to_string());

        // 貸方取引先名(AA)
        row_list.push("".to_string());

        exp_list.push(row_list);
    }
    return exp_list;
}

#[tauri::command]
pub fn get_setting() -> Result<Vec<Setting>, String> {
    let res = block_on(setting::get_setting());
    res
}

// #[tauri::command]
// pub fn get_setting_by_id(id: i64) -> Result<Setting, String> {
//     let res = block_on(setting::get_setting_by_id(id));
//     res
// }

#[tauri::command]
pub fn update_setting(setting_list: Vec<Setting>) -> Result<bool, String> {
    let res = block_on(setting::update_setting(setting_list));
    res
}

#[tauri::command]
pub fn comp_setting(
    old_setting_list: Vec<Setting>,
    new_setting_list: Vec<Setting>,
) -> Result<bool, String> {
    for old in old_setting_list {
        let old_id = old.id;
        let new_row = new_setting_list.iter().find(|e| e.id == old_id).unwrap();
        if new_row.param != old.param {
            return Ok(false);
        }
    }
    Ok(true)
}
