// JSONの読み込みが完了したか  // Whether the JSON has been loaded
let isJsonLoaded = false;
// ブロックするメディアのリスト   // List of media to block
let blockMediaList;
// ブロックするワードのリスト  // List of words to block
let blockWordList;

// JSONをローカルストレージから読み込み  // Load JSON from local storage
chrome.storage.local.get("blockList", function (result) {
    json = JSON.parse(result.blockList);
    if (json !== undefined) {
        isJsonLoaded = true;
        // ブロックするメディアのリスト
        blockMediaList = json["media_list"];
        // ブロックする単語のリスト
        blockWordList = json["word_list"];
    }
});

// サイトの画像を置き換えるための画像 #efefef   // Image to replace site images
const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/x8AAuMB8DtXNJsAAAAASUVORK5CYII=";

// 現在のURLを取得  // Get current URL
const currentUrl = document.location.toString();

// URLごとに処理を変えるためのフラグ  // Flag to change processing for each URL
let urlTag;

// 分岐処理 // Branch processing
if (currentUrl.match(/https?:\/\/www.yahoo.co.jp\/.*/g)) {
    urlTag = 0;
} else if (currentUrl.match(/https?:\/\/news.yahoo.co.jp\/.*/g)) {
    urlTag = 1;
}


// ブロックするメディアの可否と画像を非表示にするかどうかを返す  // Returns whether to block the media and whether to hide the image
function checkMedia(str) {
    for (let media of blockMediaList) {
        if (media["media"].indexOf(str) !== -1) {
            return [true, media["da"]];
        }
    }
    return [false, false];
}
// ブロックするワードの可否と画像を非表示にするかどうかを返す  // Returns whether to block the word and whether to hide the image
function checkWord(str) {
    for (let word of blockWordList) {
        if (str.indexOf(word["word"]) !== -1) {
            return [true, word["da"]];
        }
    }
    return [false, false];
}



// メイン処理 // Main process
function removeArticles() {
    let articles;
    switch (urlTag) {
        // Yahoo!トップページ  // Yahoo! Top page
        case 0:
            // 上部の記事一覧  // Top article list
            articles = document.querySelectorAll("#Topics > article article");
            for (let article of articles) {
                const word = article.querySelector("h1").textContent;
                const wordResult = checkWord(word);

                // 該当項目かつ画像非表示のみでない(記事を削除する場合)  // If it is a corresponding item and not only an image is hidden (when deleting the article)
                if (wordResult[0] && wordResult[1]) {
                    article.setAttribute('style', 'display:none');
                } else {
                    // 該当項目でなければ非表示解除 (解除しないと、どんどん記事が消えてく)  // If it is not a corresponding item, remove the hidden (if you do not remove it, all article will disappear)
                    article.setAttribute('style', '');
                }
            }

            // 下部の記事一覧  // Bottom article list
            articles = document.querySelectorAll("#qurireco article");
            for (let article of articles) {
                const media = article.querySelector("cite").textContent;
                const word = article.querySelector("h1").textContent;

                const mediaResult = checkMedia(media);
                const wordResult = checkWord(word);

                // すべて非表示 (画像なし)  // All hidden (no image)
                const deleteAll = mediaResult[1] || wordResult[1];

                // 記事削除  // Delete article
                if (mediaResult[0] || wordResult[0]) {
                    if (deleteAll) {
                        article.setAttribute('style', 'display:none');
                    } else {
                        article.querySelector("img").setAttribute("src", image);
                    }
                }
            }
            break;

        // Yahoo!ニュースページ  // Yahoo! News page
        case 1:
            // 上部の記事一覧  // Top article list
            articles = document.querySelectorAll("#uamods-topics ul > li");
            for (let article of articles) {
                const word = article.querySelector("a").textContent;
                const wordResult = checkWord(word);

                // 該当項目かつ画像非表示のみでない(記事を削除する場合)  // If it is a corresponding item and not only an image is hidden (when deleting the article)
                if (wordResult[0] && !wordResult[1]) {
                    article.setAttribute('style', 'display:none');
                } else {
                    // 該当項目でなければ非表示解除 (解除しないと、どんどん記事が消えてく)  // If it is not a corresponding item, remove the hidden (if you do not remove it, all article will disappear)
                    article.setAttribute('style', '');
                }
            }

            // 下部の記事一覧  // Bottom article list
            articles = document.querySelectorAll("#newsFeed .newsFeed_list li");

            for (let article of articles) {
                try {
                    const media = article.querySelector(".newsFeed_item_media").textContent;
                    const word = article.textContent;

                    const mediaResult = checkMedia(media);
                    const wordResult = checkWord(word);

                    // すべて非表示 (画像なし)  // All hidden (no image)
                    const deleteAll = mediaResult[1] || wordResult[1];

                    // 記事削除  // Delete article
                    if (mediaResult[0] || wordResult[0]) {
                        if (deleteAll) {
                            article.setAttribute('style', 'display:none');
                        } else {
                            let thumbnail = article.querySelector("img");
                            if (thumbnail !== null) {
                                thumbnail.setAttribute('style', 'display:none');
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            break;

        default:
            console.log(`Sorry, we are out of ${urlTag}.`);
    }
}


// ページ読み込み時に実行 // Execute when page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // JSONが読み込まれるまで待つ（初回実行） // Wait until JSON is loaded (first execution)
    const timerId = setInterval(() => {
        if (isJsonLoaded) {
            clearInterval(timerId);
            removeArticles();
        }
    }, 5);

    // ページ内の要素が変更されたときに実行 // Execute when the element in the page is changed
    const config = {
        childList: true,
        subtree: true
    };
    const observer = new MutationObserver(removeArticles);
    observer.observe(document.body, config);
});



