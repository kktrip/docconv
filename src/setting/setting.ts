import { invoke } from "@tauri-apps/api/tauri";

import { message, ask } from "@tauri-apps/api/dialog";

const ham = document.getElementById("ham");
const menu_wrapper = document.getElementById("menu_wrapper");
const settingTable = <HTMLTableElement>document.getElementById("setting_list");
const input_setting = document.getElementsByClassName("input-setting");
const input_settings = Array.from(input_setting);
let settingList = new Array();

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

async function commandCompSetting(
  oldSettingList: Object,
  newSettingList: Object
): Promise<boolean> {
  return await invoke("comp_setting", {
    oldSettingList: oldSettingList,
    newSettingList: newSettingList,
  });
}

function getSettings() {
  commandGetSetting().then((list) => {
    settingList = list;
    if (settingTable != null) {
      const objList = Object.values(list);
      console.log(objList);

      objList.forEach((obj: any) => {
        if (obj != null) {
          const tr = document.createElement("tr");
          settingTable.appendChild(tr);
          const td_id = document.createElement("td");
          const td_name = document.createElement("td");
          const td_desc = document.createElement("td");
          const td_param = document.createElement("td");
          const input_param = document.createElement("input");
          td_id.textContent = obj.id;
          td_id.style.display = "none";
          td_name.textContent = obj.name;
          td_name.className = "st-td-name";
          td_desc.textContent = obj.description;
          td_desc.className = "st-td-desc";
          input_param.value = obj.param;
          input_param.setAttribute("id", obj.id);
          input_param.className = "input-setting";
          tr.appendChild(td_id);
          tr.appendChild(td_name);
          tr.appendChild(td_desc);
          tr.appendChild(td_param);
          td_param.appendChild(input_param);
        }
      });
      // });
    }
  });
}

async function updateSetting(settingList: Object) {
  let res = await commandUpdateSetting(settingList);
  if (res) {
    message("設定を保存しました", {
      type: "info",
      title: "設定保存",
    });
  } else {
    message("設定の保存に失敗しました", {
      type: "error",
      title: "保存失敗",
    });
  }
}

// 値の変化をチェック
async function compSetting(oldSettingList: Object, newSettingList: Object) {
  let res = await commandCompSetting(oldSettingList, newSettingList);

  if (!res) {
    // 値に変更があった場合
    let yn = await ask("設定を保存しますか？", {
      title: "保存確認",
      type: "warning",
    });
    if (yn) {
      updateSetting(newSettingList);
    }
  } else {
    // 設定に変更がなかった場合
    updateSetting(newSettingList);
  }
}

if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}

if (input_settings != null) {
  // for (let i = 0; i < input_settings.length; i++) {

  // Uncaught TypeError: Cannot read properties of undefined (reading 'addEventListener')
  input_settings[0].addEventListener("focusout", function () {
    console.log("input_setting focusout");

    let regexp;
    let id_str = input_settings[0].getAttribute("id") ?? "";
    let id = parseInt(id_str) ?? 0;
    let val = input_settings[0].textContent ?? "";

    switch (id) {
      case 1:
        // ファイル判定条件1 セル位置
        // 英字3文字以下 + 数字1～1048576
        regexp = /[A-Z]{1,3}[0-9]{1,7}^$/;
        let chk = val.replace(regexp, "$1");
        if (chk != null) {
          console.log("id:1 regexp" + chk);
        } else {
          console.log("id:1 regexp is null");
        }
    }
  });
}

const buttonSave = document.getElementById("save-button");
if (buttonSave != null) {
  buttonSave.addEventListener("click", saveSetting);
  function saveSetting() {
    let newSettingList = [];
    for (let row of Array.from(settingTable.rows)) {
      let stRow;
      let id = 0;
      let prm = "";
      let i = 0;
      for (let cell of Array.from(row.cells)) {
        if (i == 0) {
          if (cell.textContent != null) id = parseInt(cell.textContent);
        } else if (i == 3) {
          let input = <HTMLInputElement>cell.firstElementChild;
          if (input != null) {
            prm = input.value;
          }
        }
        i += 1;
      }
      // name, descriptionの値はダミー
      stRow = { id: id, name: "", description: "", param: prm };
      newSettingList.push(stRow);
    }
    compSetting(settingList, newSettingList);
  }
}
