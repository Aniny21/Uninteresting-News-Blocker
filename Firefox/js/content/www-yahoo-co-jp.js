// Yahoo! JAPAN トップページ (www.yahoo.co.jp)

let imageUrl;

function removeArticles() {
    // 上部の記事一覧
    const topArticles = document.querySelectorAll("#Topics > article article");
    for (const article of topArticles) {
        const word = article.querySelector("h1").textContent;
        const wordResult = checkWord(word);

        // 該当項目かつ画像非表示のみでない(記事を削除する場合)
        if (wordResult[0] && wordResult[1]) {
            article.setAttribute('style', 'display:none');
        } else {
            // 該当項目でなければ非表示解除 (解除しないと、どんどん記事が消えてく)
            article.setAttribute('style', '');
        }
    }

    // 下部の記事一覧
    const bottomArticles = document.querySelectorAll("#qurireco article");
    for (const article of bottomArticles) {
        const media = article.querySelector("cite").textContent;
        const word = article.querySelector("h1").textContent;

        const mediaResult = checkMedia(media);
        const wordResult = checkWord(word);

        // 記事削除
        if (mediaResult[0] || wordResult[0]) {
            // すべて非表示 (画像なし)
            if (mediaResult[1] || wordResult[1]) {
                article.setAttribute('style', 'display:none');
            } else {
                article.querySelector("img").setAttribute("src", imageUrl);
            }
        }
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', async () => {
    // 画像の取得
    imageUrl = await getImage();

    // 初回実行
    removeArticles();

    // ページ内の要素が変更されたときに実行
    const config = {
        childList: true,
        subtree: true
    };
    const observer = new MutationObserver(removeArticles);
    observer.observe(document.body, config);
});
