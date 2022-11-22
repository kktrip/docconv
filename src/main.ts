import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { save, message } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";

// =================================================================

const modal = document.getElementById("easyModal");
const buttonClose = document.getElementsByClassName("modalClose")[0];
const buttonDecision = document.getElementById("modal-desicion");
let gfilePath: string = ""; //処理中のファイルのフルパス

let settingList: any;
let stCsvPrefix: any;
commandGetSetting().then((st) => {
  settingList = st;
  stCsvPrefix = settingList[12].param; // CSVファイル名のプレフィックス
});

function modalOpen(ary: string[]) {
  if (modal != null) {
    modal.style.display = "block";

    const jsSelectBox = document.querySelector(".js-selectbox");

    if (jsSelectBox != null) {
      const ele = jsSelectBox.firstChild;
      if (ele != null) {
        jsSelectBox.removeChild(ele);
      }
    }

    const selectWrap = document.createElement("div");
    selectWrap.classList.add("selectwrap");
    const select = document.createElement("select");
    select.setAttribute("id", "sheet-select");

    // ウィンドウをずらすとリストの表示位置が元の位置で開かれるバグあり
    select.classList.add("select");
    ary.forEach((a) => {
      const option = document.createElement("option");
      option.value = a;
      option.textContent = a;
      select.appendChild(option);
    });
    selectWrap.appendChild(select);
    if (jsSelectBox != null) jsSelectBox.appendChild(selectWrap);
  }
}

// バツ印がクリックされた時
if (buttonClose != null) {
  buttonClose.addEventListener("click", modalClose);
  function modalClose() {
    if (modal != null) modal.style.display = "none";
  }
}

// 決定ボタンがクリックされた時
if (buttonDecision != null) {
  buttonDecision.addEventListener("click", modalFix);
  // 決定ボタン押下時に選択していたセレクトボックスの値を返す
  function modalFix() {
    if (modal != null) modal.style.display = "none";
    const select: HTMLInputElement = <HTMLInputElement>(
      document.getElementById("sheet-select")
    );
    if (select != null) {
      getValues(select.value);
    }
  }
}

// モーダルコンテンツ以外がクリックされた時
addEventListener("click", outsideClose);
function outsideClose(e: Event) {
  if (e.target == modal) {
    if (modal != null) modal.style.display = "none";
  }
}

const ham = document.getElementById("ham");
const menu_wrapper = document.getElementById("menu_wrapper");
if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}

const go_setting = document.getElementById("go_setting");
if (go_setting != null) {
  go_setting.addEventListener("click", function () {
    window.location.href = "setting/setting.html";
  });
}

// =================================================================

// メインプロセス::シート名リストを取得する
async function commandGetSheets(path: string): Promise<string[]> {
  return await invoke("read_sheets", {
    filepath: path,
  });
}

// メインプロセス::シート内の各値を取得する
async function commandGetValues(path: string, shNm: string): Promise<string[]> {
  return await invoke("read_values", {
    filepath: path,
    sheetname: shNm,
  });
}

// メインプロセス::特定のIDの設定内容を取得する
// async function commandGetSettingById(id: Number): Promise<string[]> {
//   return await invoke("get_setting_by_id", {
//     id: id,
//   });
// }

// 設定一覧を取得
async function commandGetSetting(): Promise<string[]> {
  return await invoke("get_setting");
}

// シートを取得する
function getSheets(path: string) {
  commandGetSheets(path).then((sheets) => {
    if (sheets.length > 1) {
      modalOpen(sheets);
    } else {
      getValues(sheets[0]);
    }
  });
}

// ファイルパスからファイル名を取得
function getFileName(filepath: string) {
  return filepath.split("\\").reverse()[0].split(".");
}

// シート内の各値を取得する
async function getValues(sheetName: string) {
  commandGetValues(gfilePath, sheetName)
    .then((res) => {
      // 値を使ってCSVファイルを作る
      let csvData = "";
      res.forEach((item) => {
        csvData = csvData + Object.values(item).join(",") + "\r\n";
      });
      // Windows前提の実装
      const fileinfo = getFileName(gfilePath);
      const filename = stCsvPrefix + fileinfo[0] + ".csv";
      save({ defaultPath: filename }).then((path) => {
        if (path) {
          writeTextFile(path, csvData)
            .then(() => {
              message("CSVファイルが出力されました。", {
                type: "info",
                title: "CSV出力完了",
              });
            })
            .catch((error) => {
              message(
                "以下のエラーが発生したため、ファイルが保存できませんでした。\r\n\r\n" +
                  error,
                {
                  type: "error",
                  title: "CSV出力エラー",
                }
              );
            });
        }
      });
    })
    .catch(() => {
      message("経費精算表のフォーマットではありません", {
        type: "error",
        title: "フォーマットエラー",
      });
    });
}

appWindow.onFileDropEvent((e) => {
  if (e.payload.type === "hover") {
    // hover
  } else if (e.payload.type === "drop") {
    const path: string[] = e.payload.paths;
    for (let i = 0; i < path.length; i++) {
      // グローバル変数にセット
      gfilePath = path[i];
      // 拡張子を抜粋
      const ext = gfilePath.split(".").pop();
      // ファイル名を取得
      const filename = getFileName(gfilePath);
      if (ext == "xlsx") {
        getSheets(gfilePath);
      } else {
        message(filename + "はExcelファイルではありません。", {
          type: "error",
          title: "ファイル種類エラー",
        });
      }
    }
  } else {
    // alert('File drop cancelled');
  }
});
