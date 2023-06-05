"use strict";

// ファイルをセーブする
document.getElementById("exportSettings").addEventListener("click", function () {
    chrome.storage.local.get("blockList", function (result) {
        let json = JSON.parse(result.blockList);
        let blob = new Blob([JSON.stringify(json)], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: "UNBlocker.json",
            saveAs: true
        });
    });
});

// ファイルをロードする
document.getElementById("importSettings").addEventListener("click", function () {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", function () {
        let file = input.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", function () {
            let json = JSON.parse(reader.result);
            chrome.storage.local.set({
                blockList: JSON.stringify(json)
            });
        });
        reader.readAsText(file);
    });
    input.click();
});