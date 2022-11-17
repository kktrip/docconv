use crate::db::setting;
use crate::db::setting::Setting;

#[tauri::command]
pub async fn get_setting_list() -> Vec<Setting> {
    let st = setting::find_by_name();
    return match st.await {
        Ok(r) => r.unwrap(),
        Err(e) => return Vec::new(),
    };
}
