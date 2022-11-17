import { invoke } from "@tauri-apps/api/tauri";

const ham = document.getElementById("ham");
const menu_wrapper = document.getElementById("menu_wrapper");

// 画面読み込み時
getSettings();

async function commandGetSettings(): Promise<string[]> {
  return await invoke("get_setting_list");
}

function getSettings() {
  commandGetSettings().then((list) => {
    list.forEach((s) => console.log(s));
  });
}

if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}
