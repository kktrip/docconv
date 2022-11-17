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
    const settingList = document.getElementById("setting_list");
    if (settingList != null) {
      const objList = Object.values(list);
      console.log(objList);

      objList.forEach((obj) => {
        const tr = document.createElement("tr");
        settingList.appendChild(tr);

        const td_name = document.createElement("td");
        const td_desc = document.createElement("td");
        const td_param = document.createElement("td");
        const input_param = document.createElement("input");
        td_name.textContent = obj.name;
        td_name.className = "st-td-name";
        td_desc.textContent = obj.description;
        td_desc.className = "st-td-desc";
        input_param.value = obj.param;
        tr.appendChild(td_name);
        tr.appendChild(td_desc);
        tr.appendChild(td_param);
        td_param.appendChild(input_param);
      });
      // });
    }
  });
}

if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}
