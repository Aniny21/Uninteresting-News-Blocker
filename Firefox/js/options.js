"use strict";

// ファイルをセーブする
$("#exportSettings").on("click", async () => {
    const json = await getBlockListAsJson();
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = $("<a>");
    a.attr("href", url);
    a.attr("download", "UNBlocker.json");
    a[0].click();
});

// ファイルをロードする
$("#importSettings").on("click", () => {
    const input = $("<input>");
    input.attr("type", "file");
    input.attr("accept", "application/json");
    input.on("change", () => {
        const file = input[0].files[0];
        const reader = new FileReader();
        reader.onload = () => {
            // jsonが正しいかどうかを判定する
            if (!isValidJson(reader.result)) {
                alert("ファイルの整合性検証に失敗しました。");
                return;
            }
            const json = JSON.parse(reader.result);
            if (confirm(`ブロックリストを${file.name}で上書きしますか？`)) {
                setBlockListAsJson(json);
            }
            // 説明文を更新する
            const explanation = $("#explanation");
            explanation.text(`ブロックリストを${file.name}で上書きしました。`);
        };
        reader.readAsText(file);
    });
    input[0].click();
});

// 画像設定
(async () => {
    const imageUrl = await getImage();
    const color = await base64ToColor(imageUrl);
    $("#imageColor").val(color);
})();
$("#imageColor").on("change", async () => {
    const color = $("#imageColor").val();
    const base64 = colorToBase64(color);
    await setImage(base64);
});
$("#resetImageColor").on("click", async () => {
    $("#imageColor").val("#efefef");
    $("#imageColor").trigger("change");
});

// 広告ブロック設定
(async () => {
    const adBlock = await getAdBlock();
    $("#adBlock").prop("checked", adBlock);
})();
$("#adBlock").on("change", async () => {
    const adBlock = $("#adBlock").prop("checked");
    await setAdBlock(adBlock);
});


// jsonが正しいかどうかを判定する
function isValidJson(j) {
    try {
        let json = JSON.parse(j);
        // media_listとword_listが存在するか
        if (!json["media_list"] || !json["word_list"]) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}