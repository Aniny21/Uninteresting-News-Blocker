// Yahoo! JAPAN ニュースページ (news.yahoo.co.jp)

let imageUrl;

// 画像を非表示にする
function hideImage(article) {
    const picture = article.querySelector("picture");
    if (picture !== null) {
        picture.querySelectorAll("source").forEach((source) => {
            source.setAttribute('type', 'image/png');
            source.setAttribute('srcset', imageUrl);
        });
    }
    const image = article.querySelector("img");
    if (image !== null) {
        image.setAttribute("src", imageUrl);
    }
}


// ホーム上部の記事一覧
function home_top() {
    const articles = document.querySelectorAll("#uamods-topics ul > li");
    for (const article of articles) {
        const word = article.querySelector("a").textContent;
        const wordResult = checkWord(word);

        // 該当項目かつ画像非表示のみでない(記事を削除する場合)
        if (wordResult[0] && wordResult[1]) {
            article.setAttribute('style', 'display:none');
        } else {
            // 該当項目でなければ非表示解除 (解除しないと、どんどん記事が消えてく)
            article.setAttribute('style', '');
        }
    }
}

// ホーム下部の記事一覧
function home_bottom() {
    const articles = document.querySelectorAll("#newsFeed .newsFeed_list li");
    for (const article of articles) {
        // newsFeed_itemクラスがない場合はスキップ
        if (!article.classList.contains("newsFeed_item")) continue;

        const media = article.querySelector(".newsFeed_item_media").textContent;
        const word = article.querySelector(".newsFeed_item_title").textContent;

        const mediaResult = checkMedia(media);
        const wordResult = checkWord(word);

        // 記事削除
        if (mediaResult[0] || wordResult[0]) {
            // すべて非表示 (画像なし)
            if (mediaResult[1] || wordResult[1]) {
                article.setAttribute('style', 'display:none');
            } else {
                hideImage(article);
            }
        }
    }
}

// トピックス下部の記事一覧
function topics_bottom() {
    const articles = document.querySelectorAll("#uamods-topics ul > li");
    for (const article of articles) {
        // newsFeed_item_linkクラスがない場合はスキップ
        if (!article.querySelector(".newsFeed_item_link")) continue;

        const word = article.querySelector("a").textContent;
        const wordResult = checkWord(word);

        if (wordResult[0]) {
            if (wordResult[1]) {
                article.setAttribute('style', 'display:none');
            } else {
                hideImage(article);
            }
        }
    }
}

// ピックアップ下部の記事一覧
function pickup_bottom() {
    const articles = document.querySelectorAll("#ualmods-timeline li");

    for (const article of articles) {
        // aタグがない場合はスキップ
        if (!article.querySelector("a")) continue;

        const media = article.querySelector("a [class^='PickupTimeLineItem__MediaName']").textContent;
        const word = article.querySelector("a [class^='PickupTimeLineItem__Title']").textContent;

        const mediaResult = checkMedia(media);
        const wordResult = checkWord(word);

        if (mediaResult[0] || wordResult[0]) {
            // すべて非表示 (画像なし)
            if (mediaResult[1] || wordResult[1]) {
                article.setAttribute('style', 'display:none');
            } else {
                hideImage(article);
            }
        }
    }
}


// ホーム
function home() {
    home_top();
    home_bottom();
}

// トピックス
function topics() {
    topics_bottom();
}

// ピックアップ
function pickup() {
    pickup_bottom();
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', async () => {
    // 画像の取得
    imageUrl = await getImage();

    const config = {
        childList: true,
        subtree: true
    };

    const url = location.href;
    const urlSub = url.split("/")[3].split("?")[0];
    if (urlSub.startsWith("topics")) {
        topics();
        const observer = new MutationObserver(topics);
        observer.observe(document.body, config);
    } else if (urlSub.startsWith("pickup")) {
        pickup();
        const observer = new MutationObserver(pickup);
        observer.observe(document.body, config);
    } else {
        home();
        const observer = new MutationObserver(home);
        observer.observe(document.body, config);
    }
});