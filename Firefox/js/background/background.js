"use strict";

(async () => {
    // 拡張機能の初期化
    await init_extension();

    // 広告ブロックの設定
    const adBlock = await getAdBlock();
    if (adBlock) {
        chrome.webRequest.onBeforeRequest.addListener(
            function (details) {
                const url = details.url.split("/")[2].split(".")[0];
                if (url === "yads") {
                    return { cancel: true };
                } else {
                    return { cancel: false };
                }
            },
            { urls: ["*://*.yahoo.co.jp/*", "*://*.yimg.jp/*",] },
            ["blocking"]
        );
    }
})();


// 初期化
async function init_extension() {
    // デフォルトのブロックリストを設定
    const blockList = {
        media_list: [
        ],
        word_list: [
        ]
    }
    // 画像データを設定
    const image = colorToBase64("#efefef");

    // 広告ブロックの設定
    const adBlock = true;

    // ブロックリストが未設定の場合はデフォルトのブロックリストを設定
    if (await getBlockListAsStr() === undefined) {
        await setBlockListAsJson(blockList);
    }
    // 画像データが未設定の場合はデフォルトの画像データを設定
    if (await getImage() === undefined) {
        await setImage(image);
    }

    // 広告ブロックが未設定の場合はデフォルトの広告ブロックを設定
    if (await getAdBlock() === undefined) {
        await setAdBlock(adBlock);
    }
}


// Optionsページから、リロードメッセージを受け取った場合、拡張機能を再度初期化する
chrome.runtime.onMessage.addListener( function(request, sender) {
    if (request.action == "reload") {
        init_extension();
    }
});