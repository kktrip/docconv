import { invoke } from "@tauri-apps/api/tauri";

import { message, ask } from "@tauri-apps/api/dialog";

const ham = document.getElementById("ham");
const menu_wrapper = document.getElementById("menu_wrapper");
const settingTable = <HTMLTableElement>document.getElementById("setting_list");

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

// async function commandCompSetting(
//   oldSettingList: Object,
//   newSettingList: Object
// ): Promise<boolean> {
//   return await invoke("comp_setting", {
//     oldSettingList: oldSettingList,
//     newSettingList: newSettingList,
//   });
// }

function getSettings() {
  commandGetSetting().then((list) => {
    if (settingTable != null) {
      const objList = Object.values(list);

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
          td_param.className = "st-td-param";
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
// async function compSetting(oldSettingList: Object, newSettingList: Object) {
//   let res = await commandCompSetting(oldSettingList, newSettingList);

//   if (!res) {
//     // 値に変更があった場合
//     let yn = await ask("設定を保存しますか？", {
//       title: "保存確認",
//       type: "warning",
//     });
//     if (yn) {
//       updateSetting(newSettingList);
//     }
//   } else {
//     // 設定に変更がなかった場合
//     updateSetting(newSettingList);
//   }
// }

if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}

const go_main = document.getElementById("go_main");
if (go_main != null) {
  go_main.addEventListener("click", function () {
    window.location.href = "../index.html";
  });
}

const buttonReset = document.getElementById("reset_button");
if (buttonReset != null) {
  buttonReset.addEventListener("click", resetSetting);
}

const buttonSave = document.getElementById("save_button");
if (buttonSave != null) {
  buttonSave.addEventListener("click", saveSetting);
}

function resetSetting() {
  ask("設定が初期化されます。よろしいですか？\n（保存はされません）", {
    title: "確認",
  }).then(() => {
    let rowindex = 0;
    for (let row of Array.from(settingTable.rows)) {
      let colindex = 0;
      for (let cell of Array.from(row.cells)) {
        if (colindex == 3) {
          let input = <HTMLInputElement>cell.firstElementChild;
          switch (rowindex + 1) {
            case 1:
              // ファイル判定条件1 セル行番号
              input.value = "1";
              break;
            case 2:
              // ファイル判定条件1 セル列番号
              input.value = "1";
              break;
            case 3:
              // ファイル判定条件1 文字
              input.value = "経費精算表";
              break;
            case 7:
              // 読み取り開始行
              input.value = "6";
              break;
            case 8:
              // 読み取り開始列
              input.value = "1";
              break;
            case 9:
              // 	読み取り最大行数
              input.value = "100";
              break;
            case 10:
              // 読み取り最大列数
              input.value = "10";
              break;
            case 11:
              // 読み取り終了条件 文字
              input.value = "合計";
              break;
            case 12:
              // 消費税率
              input.value = "0.1";
              break;
            case 13:
              // 	CSVファイル名のプレフィックス
              input.value = "convert_";
              break;
            default:
              input.value = "";
              break;
          }
        }
        colindex += 1;
      }
      rowindex += 1;
    }
  });
}

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
  if (paramCheck()) {
    updateSetting(newSettingList);
  }
}

// 入力値チェック
// true: チェックOK, false: チェックNG
function paramCheck() {
  let ret = true;

  const input_settings = Array.from(
    document.getElementsByClassName("input-setting")
  );
  const is4 = <HTMLInputElement>input_settings[3];
  const is5 = <HTMLInputElement>input_settings[4];
  const is6 = <HTMLInputElement>input_settings[5];

  for (let i = 0; i < input_settings.length; i++) {
    const input_setting = <HTMLInputElement>input_settings[i];

    let regex = /^$/;
    let noCheckFlg = false;
    let id_str = input_setting.getAttribute("id") ?? "";
    let id = parseInt(id_str) ?? 0;
    let val = input_setting.value ?? "";

    const td_param = document.getElementsByClassName("st-td-param")[i];
    const p_param = document.createElement("p");
    p_param.className = "input-error-text";
    p_param.setAttribute("id", "param_" + id);

    const p = document.getElementById("param_" + id);
    input_setting.classList.remove("input-error");
    if (p != null) td_param.removeChild(p);

    switch (id) {
      case 1:
        // ファイル判定条件1 セルの行番号
        // （必須入力）数字1～1000
        p_param.textContent = "1～1000の数値を入力してください。";
        regex = /^([1-9][0-9]?[0-9]?|0|1000)$/;
        break;
      case 2:
        // ファイル判定条件1 セルの列番号
        // （必須入力）数字1～1000
        p_param.textContent = "1～1000の数値を入力してください。";
        regex = /^([1-9][0-9]?[0-9]?|0|1000)$/;
        break;
      case 3:
        // ファイル判定条件1 文字
        // （必須入力）任意の文字列1～100文字以下
        p_param.textContent = "1～100文字以内で入力してください。";
        regex = /^.{1,100}$/;
        break;
      case 4:
        // ファイル判定条件2 セルの行番号
        // （任意入力）数字1～1000
        if (val == "" && is5.value == "" && is6.value == "") {
          noCheckFlg = true;
        } else {
          p_param.textContent = "1～1000の数値を入力してください。";
          regex = /^([1-9][0-9]?[0-9]?|0|1000)$/;
        }
        break;
      case 5:
        // ファイル判定条件2 セルの列番号
        // （任意入力）数字1～1000
        if (val == "" && is4.value == "" && is6.value == "") {
          noCheckFlg = true;
        } else {
          p_param.textContent = "1～1000の数値を入力してください。";
          regex = /^([1-9][0-9]?[0-9]?|0|1000)$/;
        }
        break;
      case 6:
        // ファイル判定条件2 文字
        // （任意入力）任意の文字列1～100文字以下
        if (val == "" && is4.value == "" && is5.value == "") {
          noCheckFlg = true;
        } else {
          p_param.textContent = "1～100文字以内で入力してください。";
          regex = /^.{1,100}$/;
        }
        break;
      case 7:
        // 読み取り開始行
        //（必須入力）100以下の数値
        p_param.textContent = "1～100の数値を入力してください。";
        regex = /^([1-9][0-9]?|0|100)$/;
        break;
      case 8:
        // 読み取り開始列
        //（必須入力）100以下の数値
        p_param.textContent = "1～100の数値を入力してください。";
        regex = /^([1-9][0-9]?|0|100)$/;
        break;
      case 9:
        // 読み取り最大行数
        //（必須入力）100以下の数値
        p_param.textContent = "1～100の数値を入力してください。";
        regex = /^([1-9][0-9]?|0|100)$/;
        break;
      case 10:
        // 読み取り最大列数
        //（必須入力）100以下の数値
        p_param.textContent = "1～100の数値を入力してください。";
        regex = /^([1-9][0-9]?|0|100)$/;
        break;
      case 11:
        // 読み取り終了条件 文字
        //（必須入力）任意の文字列1～100文字以下
        p_param.textContent = "100文字以内で入力してください。";
        regex = /^.{1,100}$/;
        break;
      case 12:
        // 消費税率
        //（必須入力）0.1～1以下の小数
        p_param.textContent = "0.01から0.99の数値を入力してください。";
        regex = /^0\.[0-9][1-9]?$/;
        break;
      case 13:
        // CSVファイル名のプレフィックス
        //（必須入力）任意の文字列1～100文字以下
        p_param.textContent = "100文字以内で入力してください。";
        regex = /^.{1,100}$/;
        break;
      default:
        noCheckFlg = true;
        break;
    }

    if (!noCheckFlg && !regex.test(val)) {
      input_setting.classList.add("input-error");
      td_param.appendChild(p_param);
      ret = false;
    }
  }
  return ret;
}
