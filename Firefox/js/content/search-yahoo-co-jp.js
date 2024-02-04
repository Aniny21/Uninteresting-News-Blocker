// Yahoo! JAPAN 検索ページ (search.yahoo.co.jp)

function removeWords() {
    const lis = document.querySelectorAll("section#cpick > ul > li");
    for (const li of lis) {
        const word = li.querySelector("a").textContent;
        const wordResult = checkWord(word);

        // 該当項目かつ画像非表示のみでない(記事を削除する場合)
        if (wordResult[0] && wordResult[1]) {
            li.setAttribute('style', 'display:none');
        } else {
            // 該当項目でなければ非表示解除 (解除しないと、どんどん記事が消えてく)
            li.setAttribute('style', '');
        }
    }

}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', async () => {
    // 処理を軽くするため検索ページのホーム以外では実行しない
    const url = location.href;
    if (url.split("/")[3].startsWith("search")) {
        return;
    }

    // 初回実行
    removeWords();

    // ページ内の要素が変更されたときに実行
    const config = {
        childList: true,
        subtree: true
    };
    const observer = new MutationObserver(removeWords);
    observer.observe(document.body, config);
});
