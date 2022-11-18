import { invoke } from "@tauri-apps/api/tauri";

const ham = document.getElementById("ham");
const menu_wrapper = document.getElementById("menu_wrapper");
const settingList = <HTMLTableElement>document.getElementById("setting_list");

// 画面読み込み時
getSettings();

async function commandGetSetting(): Promise<string[]> {
  return await invoke("get_setting");
}

async function commandUpdateSetting(settingList: Object): Promise<string[]> {
  return await invoke("update_setting", {
    settingList: settingList,
  });
}

function getSettings() {
  commandGetSetting().then((list) => {
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

function updateSetting(settingList: Object) {
  commandUpdateSetting(settingList).then((res) => {
    if (res) {
      console.log("更新成功");
    } else {
      console.log("更新失敗");
    }
  });
}

if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}

const buttonSave = document.getElementById("save-button");
if (buttonSave != null) {
  buttonSave.addEventListener("click", saveSetting);
  function saveSetting() {
    let newSettingList = [];
    for (let row of Array.from(settingList.rows)) {
      let stRow;
      let nm = "";
      let prm = "";
      let i = 0;
      for (let cell of Array.from(row.cells)) {
        if (i == 2) {
          let input = cell.firstElementChild;
          prm = input.value;
        } else {
          if (i == 0) {
            nm = cell.textContent;
          }
        }
        i += 1;
      }
      stRow = { id: 0, name: nm, description: "", param: prm };
      newSettingList.push(stRow);
    }
    updateSetting(newSettingList);
  }
}
