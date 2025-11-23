/* ===== 共通関数: 色の計算 ===== */

/**
 * HSVをRGBに変換する
 */
function hsvToRgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [
        Math.round(f(5) * 255),
        Math.round(f(3) * 255),
        Math.round(f(1) * 255)
    ];
}

/**
 * RGBをHSVに変換する
 */
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max, d = max - min;
    s = max === 0 ? 0 : d / max;
    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d) + (g < b ? 6 : 0); break;
            case g: h = ((b - r) / d) + 2; break;
            case b: h = ((r - g) / d) + 4; break;
        }
        h *= 60;
    }
    return [h, s, v];
}

/**
 * RGBをHEXに変換する
 */
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x =>
        x.toString(16).padStart(2, '0')
    ).join('').toUpperCase();
}

/**
 * HEXをRGBに変換する
 */
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

/**
 * 値が空白かどうかをチェックする
 */
function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === '';
}

/**
 * RGBをD65のXYZに変換する
 */
function rgbToXyz({ r, g, b }) {
    // 0-255 → 0-1
    r /= 255; g /= 255; b /= 255;

    // ガンマ補正
    r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
    g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
    b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

    // sRGB → XYZ (D65)
    return {
        x: r * 0.4124 + g * 0.3576 + b * 0.1805,
        y: r * 0.2126 + g * 0.7152 + b * 0.0722,
        z: r * 0.0193 + g * 0.1192 + b * 0.9505
    };
}

/**
 * D65のXYZをdE（色差）に変換する
 */
function xyzToLab({ x, y, z }) {
    // D65白色点
    const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;

    x /= Xn; y /= Yn; z /= Zn;

    const f = t => (t > 0.008856) ? Math.cbrt(t) : (7.787 * t + 16 / 116);

    return {
        L: 116 * f(y) - 16,
        a: 500 * (f(x) - f(y)),
        b: 200 * (f(y) - f(z))
    };
}

/**
 * LABからdEを計算する
 */
function deltaE(lab1, lab2) {
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
}


/* ===== 共通関数: アニメーション ===== */

function animateAddFeedback(button, iconSelector = 'i') {
    const icon = button.querySelector(iconSelector);
    if (!icon) return;

    // アイコンをチェックに変更
    icon.classList.remove('fa-plus');
    icon.classList.add('fa-check');
    button.classList.add('copied-feedback');

    // 少ししてフェードアウト
    setTimeout(() => icon.classList.add('fade-out'), 500);

    // 元に戻す
    setTimeout(() => {
        icon.classList.remove('fa-check', 'fade-out');
        icon.classList.add('fa-plus');
        button.classList.remove('copied-feedback');
    }, 800);
}

function animateCopyFeedback(button, iconSelector = 'i') {
    const icon = button.querySelector(iconSelector);
    if (!icon) return;

    //アイコンの切り替え
    icon.classList.remove('fa-copy');
    icon.classList.add('fa-check');
    button.classList.add('copied-feedback');

    setTimeout(() => icon.classList.add('fade-out'), 500);

    setTimeout(() => {
        icon.classList.remove('fa-check', 'fade-out');
        icon.classList.add('fa-copy');
        button.classList.remove('copied-feedback');
    }, 800);
}

function animateErrorFeedback(button, originalIcon, iconSelector = 'i') {
    const icon = button.querySelector(iconSelector);
    if (!icon) return;

    // バツアイコンに変更
    icon.classList.remove(originalIcon);
    icon.classList.add('fa-xmark');
    button.classList.add('error-feedback');

    // 少ししてフェードアウト
    setTimeout(() => icon.classList.add('fade-out'), 500);

    // 元に戻す
    setTimeout(() => {
        icon.classList.remove('fa-xmark', 'fade-out');
        icon.classList.add(originalIcon);
        button.classList.remove('error-feedback');
    }, 800);
}
