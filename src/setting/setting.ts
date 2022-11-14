const ham = document.getElementById("ham");
const menu_wrapper = document.getElementById("menu_wrapper");

if (ham != null && menu_wrapper != null) {
  ham.addEventListener("click", function () {
    ham.classList.toggle("clicked");
    menu_wrapper.classList.toggle("clicked");
  });
}

// メインメニュー押下時
const go_setting = document.querySelector("#go_main");
if (go_setting != null) {
  go_setting.addEventListener("click", () => {
    window.location.href = "main.html";
  });
}
