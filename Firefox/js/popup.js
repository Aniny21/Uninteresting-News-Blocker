"use strict";

switch (location.pathname.split("/").pop().split(".")[0]) {
    case "index":
        // メインメニュー
        const text = $("#text");
        //マウスオーバー時のコメント変更
        $("#word").on("mouseover", () => {
            text.html("指定した用語が含まれたニュースを<br>ブロックします。");
        });
        $("#media").on("mouseover", () => {
            text.html("指定したメディアのニュースを<br>ブロックします。");
        });
        $("#settings").on("mouseover", () => {
            text.html("アドオンの設定を変更します。<br>&nbsp;");
        });
        $("#support").on("mouseover", () => {
            text.html("このアドオンを支援するための<br>項目を表示します。");
        });
        // クリック時の処理
        $("#word").on("click", () => {
            const url = chrome.runtime.getURL("html/popup/word.html");
            location.assign(url);
        });
        $("#media").on("click", () => {
            const url = chrome.runtime.getURL("html/popup/media.html");
            location.assign(url);
        });
        $("#settings").on("click", () => {
            // Firefoxだとabout:addonsが開くのでコメントアウト
            // chrome.runtime.openOptionsPage();
            // 新しいタブで開く
            const url = chrome.runtime.getURL("html/options/index.html");
            chrome.tabs.create({ url: url });
        });
        $("#support").on("click", () => {
            const url = chrome.runtime.getURL("html/popup/support.html");
            location.assign(url);
        });
        break;
    case "word":
        addMediaOrWord("word");
        break;
    case "media":
        addMediaOrWord("media");
        break;
    default:
        $("#back").on("click", () => {
            history.back();
        });
        break;
}

// 文字の先頭を大文字にする
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inputを点滅させる
function blinkInput() {
    const wordInput = $("#wordInput");
    wordInput.focus();
    setTimeout(() => { wordInput.attr('style', 'border-color:#ddd'); }, 0);
    setTimeout(() => { wordInput.attr('style', ''); }, 50);
    setTimeout(() => { wordInput.attr('style', 'border-color:#ddd'); }, 100);
    setTimeout(() => { wordInput.attr('style', ''); }, 150);
    setTimeout(() => { wordInput.attr('style', 'border-color:#ddd'); }, 200);
    setTimeout(() => { wordInput.attr('style', ''); }, 250);
}

async function addMediaOrWord(action) {
    // 表示用の文字列の接続部分を設定
    let join;
    switch (action) {
        case "word":
            join = "を含む";
            break;
        case "media":
            join = "の";
            break;
        default:
            return;
    }

    // 記事すべてを削除（非表示）するか、画像のみを削除するかの設定
    let isDeleteAll = true;
    $("#hideImageOnly").on("click", () => {
        isDeleteAll = !isDeleteAll;
        if (isDeleteAll) {
            $("#image").attr("src", "/images/image.png");
        } else {
            $("#image").attr("src", "/images/blockImage.png");
        }
    });

    let currentPos = 0;
    // 戻るボタンを押した時の処理
    $("#back").on("click", () => {
        switch (currentPos) {
            case 0:
                history.back();
                break;
            case 1:
                location.reload(true);
                break;
            default:
                break;
        }
    });

    let json = await getBlockListAsJson();

    // (単語orメディア)追加
    $(`#add${capitalize(action)}`).on("click", async () => {
        const wordInput = $("#wordInput");
        // 入力が無ければinputを点滅させる
        if (wordInput.val() === "") {
            blinkInput();
            return;
        }

        // HTML内部を削除
        const mainDom = $(".main");
        const p = $("<p>");
        mainDom.text("");

        // 過去の設定を取得
        const items = await getBlockListAsDict(action);

        // OPTIMIZE: フラグを使わない方法に
        // 設定を変更するかのフラグ
        let change = false;
        // 入力された(単語orメディア)が過去に追加されていれば
        if (Object.keys(items).includes(wordInput.val())) {
            // 画像非表示の設定も同じであれば
            if (items[wordInput.val()] === isDeleteAll) {
                p.text(`"${wordInput.val()}"は既に追加済みです。`);
            } else {
                // 画像非表示の設定が違ったら元の値を削除
                json[`${action}_list`].some(function (v, i) {
                    if (v[`${action}`] == wordInput.val()) json[`${action}_list`].splice(i, 1);
                });
                p.text(`"${wordInput.val()}"は既に追加済みですが、設定が異なったため上書き保存されました。`);
                change = true;
            }
        } else {
            if (isDeleteAll) {
                p.text(`"${wordInput.val()}"${join}すべての記事が非表示になります。`);
                change = true;
            } else {
                p.text(`"${wordInput.val()}"${join}すべての記事の画像のみ非表示になります。`);
                change = true;
            }
        }
        // 値を追加
        if (change) {
            json[`${action}_list`].push({ [`${action}`]: wordInput.val(), da: isDeleteAll });
            await setBlockListAsJson(json);
            json = await getBlockListAsJson();
        }

        mainDom.append(p);

        setTimeout(() => {
            location.reload(true);
        }, 1500);
    });

    // 前回追加した(単語orメディア)を削除
    $(`#deletePrevious${capitalize(action)}`).on("click", async () => {
        const previousWord = json[`${action}_list`].pop()[`${action}`];
        await setBlockListAsJson(json);
        json = await getBlockListAsJson();
        const mainDom = $(".main");
        const p = $("<p>");
        mainDom.text("");
        p.text(`"${previousWord}"が削除されました。`);
        mainDom.append(p);

        setTimeout(() => {
            location.reload(true);
        }, 1000);
    });

    // すべての(単語orメディア)を表示
    $(`#showAll${capitalize(action)}`).on("click", async () => {
        const mainDom = $(".main");
        mainDom.text("");

        // 現在の位置を記録
        currentPos = 1;

        if (json[`${action}_list`].length === 0) {
            const p = $("<p>");
            p.text("まだ何も追加されていません。");
            mainDom.append(p);
            return;
        }

        for (const word of json[`${action}_list`]) {
            // ワードリストのひな形
            const wordList = $("<div>");
            wordList.attr("class", "word-list");
            wordList.attr("id", word[`${action}`]);
            mainDom.append(wordList);

            // 単語表示部
            const wordListWord = $("<div>");
            wordListWord.attr("class", "word-list-word");
            wordListWord.text(word[`${action}`]);
            wordList.append(wordListWord);

            // "画像"の画像表示部
            const imageImage = $("<img>");
            imageImage.attr("class", "word-list-image image-image");
            if (word["da"]) {
                imageImage.attr("src", "/images/image.png");
            } else {
                imageImage.attr("src", "/images/blockImage.png");
            }
            
            wordList.append(imageImage)

            // "削除"の画像表示部
            const deleteImage = $("<img>");
            deleteImage.attr("class", "word-list-image delete-image");
            deleteImage.attr("src", "/images/delete.png");
            wordList.append(deleteImage)
        }

        // 画像評価反転
        const imageImages = $(".image-image");
        imageImages.each((_, elem) => {
            const e = $(elem);
            const w = e.parent().attr("id");

            // 現在の設定を取得+反映
            json[`${action}_list`].some(function (v, i) {
                if (v[`${action}`] == w) {
                    if (json[`${action}_list`][i]["da"]) {
                        e.attr("src", "/images/image.png")
                    } else {
                        e.attr("src", "/images/blockImage.png")
                    }
                }
            });

            // クリック時の処理
            e.on("click", async () => {
                // 画像評価反転 + srcの設定
                json[`${action}_list`].some(function (v, i) {
                    if (v[`${action}`] == w) {
                        const da = !json[`${action}_list`][i]["da"];
                        json[`${action}_list`][i]["da"] = da;
                        if (da) {
                            e.attr("src", "/images/image.png")
                        } else {
                            e.attr("src", "/images/blockImage.png")
                        }
                    }
                })
                await setBlockListAsJson(json);
                json = await getBlockListAsJson();
            });
            
        });

        // (単語orメディア)を削除
        const deleteImages = $(".delete-image");
        deleteImages.each((_, elem) => {
            const e = $(elem);
            const w = e.parent().attr("id");
            e.on("click", async () => {
                // 画像非表示の設定が違ったら元の値を削除
                json[`${action}_list`].some(function (v, i) {
                    if (v[`${action}`] == w) json[`${action}_list`].splice(i, 1);
                });
                e.parent().attr('style', 'display:none');
                await setBlockListAsJson(json);
                json = await getBlockListAsJson();
            });
        });
    });
}