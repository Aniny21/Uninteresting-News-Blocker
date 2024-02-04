"use strict";

// ブロックリストを文字列として取得
async function getBlockListAsStr() {
    const str = await new Promise(resolve => {
        chrome.storage.local.get('blockList', function (result) {
            resolve(result.blockList);
        });
    });
    return str;
}

// ブロックリストを文字列として設定
async function setBlockListAsStr(str) {
    await new Promise(resolve => {
        chrome.storage.local.set({ 'blockList': str }, function () {
            resolve();
        });
    });
}

// ブロックリストをJSONとして取得
async function getBlockListAsJson() {
    const str = await getBlockListAsStr();
    const json = JSON.parse(str);
    return json;
}

// ブロックリストをJSONとして設定
async function setBlockListAsJson(json) {
    const str = JSON.stringify(json);
    await setBlockListAsStr(str);
}

// メディアリストをJSON(辞書)として取得
async function getMediaListAsDict() {
    const json = await getBlockListAsJson();
    const mediaList = json.media_list;
    const mediaListAsDict = {};
    for (const media of mediaList) {
        mediaListAsDict[media.media] = media.da;
    }
    return mediaListAsDict;
}

// ワードリストをJSON(辞書)として取得
async function getWordListAsDict() {
    const json = await getBlockListAsJson();
    const wordList = json.word_list;
    const wordListAsDict = {};
    for (const word of wordList) {
        wordListAsDict[word.word] = word.da;
    }
    return wordListAsDict;
}

// ブロックリストをJSON(辞書)として取得
async function getBlockListAsDict(action) {
    switch (action) {
        case 'media':
            return await getMediaListAsDict();
        case 'word':
            return await getWordListAsDict();
        default:
            return {};
    }
}

// 画像を取得
async function getImage() {
    const image = await new Promise(resolve => {
        chrome.storage.local.get('image', function (result) {
            resolve(result.image);
        });
    });
    return image;
}

// 画像を設定
async function setImage(image) {
    await new Promise(resolve => {
        chrome.storage.local.set({ 'image': image }, function () {
            resolve();
        });
    });
}

// 広告ブロック設定を取得
async function getAdBlock() {
    const adBlock = await new Promise(resolve => {
        chrome.storage.local.get('adBlock', function (result) {
            resolve(result.adBlock);
        });
    });
    return adBlock;
}

// 広告ブロックを設定
async function setAdBlock(adBlock) {
    await new Promise(resolve => {
        chrome.storage.local.set({ 'adBlock': adBlock }, function () {
            resolve();
        });
    });
}