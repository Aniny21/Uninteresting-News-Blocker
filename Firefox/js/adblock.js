(async () => {
    const adBlock = await getAdBlock();
    if (!adBlock) {
        return;
    }
    const adBlockList = [
        "div#TBP._2KBoKJuH-NgDoy7jHj4A7f",
        "div.adWrap"
    ];

    document.addEventListener("DOMContentLoaded", () => {
        for (const selector of adBlockList) {
            const ads = document.querySelectorAll(selector);
            for (const ad of ads) {
                ad.style.display = "none";
            }
        }
    });
})();