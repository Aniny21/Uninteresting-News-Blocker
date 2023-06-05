"use strict";

// JSONの読み込みが完了したか  // Whether the JSON loading is complete
let isJsonLoaded = false;

// データベース操作中フラグ  // Database operation flag
let isProcessing = false;

// JSONデータ  // JSON data
let json; 

// JSONをローカルストレージから読み込み  // Load JSON from local storage
chrome.storage.local.get("blockList", function (result) {
    json = JSON.parse(result.blockList);
    if (json !== undefined) {
        isJsonLoaded = true;
        // ブロックするメディアのリスト  // List of media to block
        blockMediaList = json["media_list"];
        // ブロックする単語のリスト  // List of words to block
        blockWordList = json["word_list"];
    }
});


// Jsonファイルをローカルストレージに保存  // Save JSON file to local storage
function saveJson() {
    chrome.storage.local.set({
        blockList: JSON.stringify(json)
    });
}


// タブをリロードする  // Reload tab
function reloadTab() {
    //URLリフレッシュ
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, ([tab]) => chrome.tabs.reload(tab.id, {
        bypassCache: true
    }));
}


// 文字の先頭を大文字にする  // Make the first letter of the string uppercase
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inputを点滅させる  // Make input blink
function blinkInput() {
    let wordInput = document.getElementById("wordInput");
    wordInput.placeholder = "用語を入力";
    setTimeout(() => { wordInput.setAttribute('style', 'color:#ddd'); }, 0);
    setTimeout(() => { wordInput.setAttribute('style', 'color:#888'); }, 50);
    setTimeout(() => { wordInput.setAttribute('style', 'color:#ddd'); }, 100);
    setTimeout(() => { wordInput.setAttribute('style', 'color:#888'); }, 150);
    setTimeout(() => { wordInput.setAttribute('style', ''); }, 200);
}



// メインメニュー  // Main menu
try {
    let text = document.getElementById("text");

    //マウスオーバー時のコメント変更  // Change comment on mouseover
    document.getElementById("word").onmouseover = function () {
        text.innerText = "指定した用語が含まれたニュースを\nブロックします。";
    }
    document.getElementById("media").onmouseover = function () {
        text.innerText = "指定したメディアのニュースを\nブロックします。";
    }
    document.getElementById("settings").onmouseover = function () {
        text.innerText = "アドオンの設定を変更します。\n　";
    }
    document.getElementById("support").onmouseover = function () {
        text.innerText = "このアドオンを支援するための\n項目を表示します。";
    }

    document.getElementById("word").onclick = function () {
        location.assign("word.html");
    }
    document.getElementById("media").onclick = function () {
        location.assign("media.html");
    }
    document.getElementById("settings").onclick = function () {
        window.open("../options/options.html");
    }
    document.getElementById("support").onclick = function () {
        location.assign("support.html");
    }
} catch (e) {
    // console.error(e);
}


// 前へ戻る（トップ画面では戻るボタンがないのでエラーが出る） // Go back (there is no back button on the top screen, so an error occurs)
try {
    document.getElementById("back").onclick = function () {
        history.back();
    }
} catch (e) {
    // console.error(e);
}




// 用語・メディア共通  // Common to terms and media
// 記事すべてを削除（非表示）  // Delete (hide) all articles
let isDeleteAll = true;
document.getElementById("hideImageOnly").onclick = function () {
    isDeleteAll = !isDeleteAll;
    if (isDeleteAll) {
        document.getElementById("image").src = "../image/image.png";
    } else {
        document.getElementById("image").src = "../image/blockImage.png";
    }
}



// action: word or media
function getDict(action) {
    // OPTIMIZE: someを使う
    // 用語と設定の辞書  // Dictionary of terms and settings
    let dict = {};
    for (let item of json[`${action}_list`]) {
        dict[item[action]] = item["da"];
    }
    return dict;
}



// 用語追加
function addTerm() {
    document.getElementById("addWord").onclick = function () {
        let wordInput = document.getElementById("wordInput");

        // 入力があれば追加、無ければinputを点滅させる
        if (wordInput.value !== "") {
            // HTML内部を削除
            let mainDom = document.getElementsByClassName("main")[0]
            let p = document.createElement('p');
            mainDom.textContent = "";

            // 過去の設定を取得
            let items = getDict("word");

            // OPTIMIZE: フラグを使わない方法に
            // 設定を変更するかのフラグ
            let change = false;
            // 入力された単語が過去に追加されていれば
            if (Object.keys(items).includes(wordInput.value)) {
                // 画像非表示の設定も同じであれば
                if (items[wordInput.value] === isDeleteAll) {
                    p.textContent = `"${wordInput.value}"は既に追加済みです。`;
                } else {
                    // 画像非表示の設定が違ったら元の値を削除
                    json["word_list"].some(function (v, i) {
                        if (v.word == wordInput.value) json["word_list"].splice(i, 1);
                    });
                    p.textContent = `"${wordInput.value}"は既に追加済みですが、設定が異なったため上書き保存されました。`;
                    change = true;
                }
            } else {
                if (isDeleteAll) {
                    p.textContent = `"${wordInput.value}"を含むすべての記事が非表示になります。`;
                    change = true;
                } else {
                    p.textContent = `"${wordInput.value}"含む記事の画像のみ非表示になります。`;
                    change = true;
                }
            }
            // 値を追加
            if (change) {
                json["word_list"].push({ word: wordInput.value, da: isDeleteAll });
                saveJson();
            }

            mainDom.appendChild(p);

            setTimeout(() => {
                history.back();
            }, 2000);

        } else {
            blinkInput();
        }
    }
    // 前回追加した単語を削除
    document.getElementById("deletePreviousWord").onclick = function () {
        let previousWord = json["word_list"].pop()["word"];
        saveJson();
        let mainDom = document.getElementsByClassName("main")[0]
        let p = document.createElement('p');
        mainDom.textContent = "";
        p.textContent = `"${previousWord}"が削除されました。`;
        mainDom.appendChild(p);

        setTimeout(() => {
            history.back();
        }, 1000);
    }
    // すべての用語を表示
    document.getElementById("showAllWords").onclick = function () {
        let mainDom = document.getElementsByClassName("main")[0]
        mainDom.textContent = "";


        if (isJsonLoaded) {
            for (let word of json["word_list"]) {
                // ワードリストのひな形
                let wordList = document.createElement('div');
                wordList.setAttribute("class", "word-list");
                mainDom.appendChild(wordList);

                // ワード表示部
                let wordListWord = document.createElement('div');
                wordListWord.setAttribute("class", "word-list-word");
                wordListWord.textContent = word["word"];
                wordList.appendChild(wordListWord);

                // イメージの画像表示部
                let imageImage = document.createElement('img');
                imageImage.setAttribute("class", "word-list-image image-image");
                let imageSrc;
                if (word["da"]) {
                    imageSrc = "../image/image.png"
                } else {
                    imageSrc = "../image/blockImage.png"
                }
                imageImage.setAttribute("src", imageSrc);
                wordList.appendChild(imageImage)

                // 削除の画像表示部
                let deleteImage = document.createElement('img');
                deleteImage.setAttribute("class", "word-list-image delete-image");
                deleteImage.setAttribute("src", "../image/delete.png");
                wordList.appendChild(deleteImage)
            }

            // 画像クリック時の処理 すべての記事を消すか変更
            let imageImageList = document.getElementsByClassName("image-image");
            for (let i = 0; i < imageImageList.length; i++) {
                imageImageList[i].addEventListener("click", () => {
                    // ワード
                    let w = imageImageList[i].parentNode.querySelector(".word-list-word").textContent;
                    // 画像評価反転
                    json["word_list"].some(function (v, i) {
                        if (v.word == w) json["word_list"][i]["da"] = !json["word_list"][i]["da"]
                    });
                    if (json["word_list"][i]["da"]) {
                        imageSrc = "../image/image.png"
                    } else {
                        imageSrc = "../image/blockImage.png"
                    }
                    imageImageList[i].setAttribute("src", imageSrc);
                    saveJson();
                }, false);
            }
            // 画像クリック時の処理 削除時
            let deleteImageList = document.getElementsByClassName("delete-image");
            for (let i = 0; i < deleteImageList.length; i++) {
                deleteImageList[i].addEventListener("click", () => {
                    let w = deleteImageList[i].parentNode.querySelector(".word-list-word").textContent;
                    // 画像非表示の設定が違ったら元の値を削除
                    json["word_list"].some(function (v, i) {
                        if (v.word == w) json["word_list"].splice(i, 1);
                    });
                    deleteImageList[i].parentNode.setAttribute('style', 'display:none');
                    saveJson();
                    isProcessing = false;
                }, false);
            }

        }
    }
}

// メディア追加
function addMedia() {
    document.getElementById("addMedia").onclick = function () {
        let wordInput = document.getElementById("wordInput");

        // 入力があれば追加、無ければinputを点滅させる
        if (wordInput.value !== "") {
            // HTML内部を削除
            let mainDom = document.getElementsByClassName("main")[0]
            let p = document.createElement('p');
            mainDom.textContent = "";

            // 過去の設定を取得  // Get past settings
            let items = getDict("media");

            // OPTIMIZE: フラグを使わない方法に
            // 設定を変更するかのフラグ 
            let change = false;
            // 入力されたメディアが過去に追加されていれば
            if (Object.keys(items).includes(wordInput.value)) {
                // 画像非表示の設定も同じであれば
                if (items[wordInput.value] === isDeleteAll) {
                    p.textContent = `"${wordInput.value}"は既に追加済みです。`;
                } else {
                    // 画像非表示の設定が違ったら元の値を削除
                    json["media_list"].some(function (v, i) {
                        if (v.media == wordInput.value) json["media_list"].splice(i, 1);
                    });
                    p.textContent = `"${wordInput.value}"は既に追加済みですが、設定が異なったため上書き保存されました。`;
                    change = true;
                }
            } else {
                if (isDeleteAll) {
                    p.textContent = `"${wordInput.value}"のすべての記事が非表示になります。`;
                    change = true;
                } else {
                    p.textContent = `"${wordInput.value}"のすべての記事の画像のみ非表示になります。`;
                    change = true;
                }
            }
            // 値を追加
            if (change) {
                json["media_list"].push({ media: wordInput.value, da: isDeleteAll });
                saveJson();
            }

            mainDom.appendChild(p);

            setTimeout(() => {
                history.back();
            }, 2000);

        } else {
            blinkInput();
        }
    }

    // 前回追加したメディアを削除
    document.getElementById("deletePreviousMedia").onclick = function () {
        let previousMedia = json["media_list"].pop()["media"];
        saveJson();
        let mainDom = document.getElementsByClassName("main")[0]
        let p = document.createElement('p');
        mainDom.textContent = "";
        p.textContent = `"${previousMedia}"が削除されました。`;
        mainDom.appendChild(p);

        setTimeout(() => {
            history.back();
        }, 1000);
    }

    // すべてのメディアを表示
    document.getElementById("showAllMedia").onclick = function () {
        let mainDom = document.getElementsByClassName("main")[0]
        mainDom.textContent = "";

        if (isJsonLoaded) {
            for (let media of json["media_list"]) {
                // ワードリストのひな形
                let wordList = document.createElement('div');
                wordList.setAttribute("class", "word-list");
                mainDom.appendChild(wordList);

                // ワード表示部
                let wordListWord = document.createElement('div');
                wordListWord.setAttribute("class", "word-list-word");
                wordListWord.textContent = media["media"];
                wordList.appendChild(wordListWord);

                // イメージの画像表示部
                let imageImage = document.createElement('img');
                imageImage.setAttribute("class", "word-list-image image-image");
                let imageSrc;
                if (media["da"]) {
                    imageSrc = "../image/image.png"
                } else {
                    imageSrc = "../image/blockImage.png"
                }
                imageImage.setAttribute("src", imageSrc);
                wordList.appendChild(imageImage)

                // 削除の画像表示部
                let deleteImage = document.createElement('img');
                deleteImage.setAttribute("class", "word-list-image delete-image");
                deleteImage.setAttribute("src", "../image/delete.png");
                wordList.appendChild(deleteImage)
            }

            // 画像クリック時の処理 すべての記事を消すか変更
            let imageImageList = document.getElementsByClassName("image-image");
            for (let i = 0; i < imageImageList.length; i++) {
                imageImageList[i].addEventListener("click", () => {
                    // ワード
                    let w = imageImageList[i].parentNode.querySelector(".word-list-word").textContent;
                    // 画像評価反転
                    json["media_list"].some(function (v, i) {
                        if (v.media == w) json["media_list"][i]["da"] = !json["media_list"][i]["da"]
                    });
                    if (json["media_list"][i]["da"]) {
                        imageSrc = "../image/image.png"
                    } else {
                        imageSrc = "../image/blockImage.png"
                    }
                    imageImageList[i].setAttribute("src", imageSrc);
                    saveJson();
                }, false);
            }
            // 画像クリック時の処理 削除時
            let deleteImageList = document.getElementsByClassName("delete-image");
            for (let i = 0; i < deleteImageList.length; i++) {
                deleteImageList[i].addEventListener("click", () => {
                    let w = deleteImageList[i].parentNode.querySelector(".word-list-word").textContent;
                    // 画像非表示の設定が違ったら元の値を削除
                    json["media_list"].some(function (v, i) {
                        if (v.media == w) json["media_list"].splice(i, 1);
                    });
                    deleteImageList[i].parentNode.setAttribute('style', 'display:none');
                    saveJson();
                }, false);
            }

        }
    }
}


try {
    addTerm();
} catch (e) {
    console.log(e);
}

try {
    addMedia();
} catch (e) {
    console.log(e);
}
