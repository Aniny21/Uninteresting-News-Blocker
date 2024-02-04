// カラーコードをbase64画像に変換する
function colorToBase64(color) {
    // 128x128のcanvasを作成
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    // 背景を塗る
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    // base64に変換する
    const base64 = canvas.toDataURL();
    return base64;
}

// base64画像をカラーコードに変換する
async function base64ToColor(base64) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = base64;
    return new Promise(resolve => {
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, 1, 1).data;
            const color = rgbToHex(imageData[0], imageData[1], imageData[2]);
            resolve(color);
        };
    });
}

// rgbをhexに変換する
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}