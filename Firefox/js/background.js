// JSONをローカルストレージから読み込み
chrome.storage.local.get("blockList", function (result) {
    if (result.blockList === undefined) {
        const blockList = {
            media_list: [
                {
                    media: 'Default Media',
                    da: true
                },
            ],
            word_list: [
                {
                    word: 'Default Word',
                    da: true
                },
            ]
        }
        const jsonString = JSON.stringify(blockList);
        chrome.storage.local.set({
            blockList: jsonString
        });
    }
});