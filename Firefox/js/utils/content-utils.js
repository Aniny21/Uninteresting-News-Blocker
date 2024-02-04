let mediaList = [];
let wordList = [];

(async () => {
    const json = await getBlockListAsJson();
    // ブロックするメディアのリスト
    mediaList = json["media_list"];
    // ブロックする単語のリスト
    wordList = json["word_list"];
})();

// ブロックするメディアの可否と画像を非表示にするかどうかを返す
function checkMedia(str) {
    for (let media of mediaList) {
        if (media["media"].indexOf(str) !== -1) {
            return [true, media["da"]];
        }
    }
    return [false, false];
}
// ブロックするワードの可否と画像を非表示にするかどうかを返す
function checkWord(str) {
    for (let word of wordList) {
        if (str.indexOf(word["word"]) !== -1) {
            return [true, word["da"]];
        }
    }
    return [false, false];
}