/* ===== DOM取得 ===== */

const svCanvas = document.getElementById('svCanvas');
const hueCanvas = document.getElementById('hueCanvas');
const svCtx = svCanvas.getContext('2d');
const hueCtx = hueCanvas.getContext('2d');
const colorPreview = document.getElementById('colorPreview');
const hexValue = document.getElementById('hexInput');
const palette = document.getElementById('palette');
const clearButton = document.getElementById('clearPaletteBtn');
const STORAGE_KEY = 'colorPalette';

const hueIndicator = document.getElementById('hueIndicator');
let currentHue = 0;

const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');
const hInput = document.getElementById('hInput');
const sInput = document.getElementById('sInput');
const vInput = document.getElementById('vInput');

/* ===== 初期化 ===== */
drawHueSlider();
drawSVCanvas(currentHue);
loadSavedColors();


/* ===== 描画・更新 ===== */

function drawSVCanvas(hue) {
    const width = svCanvas.width;
    const height = svCanvas.height;

    const satGrad = svCtx.createLinearGradient(0, 0, width, 0);
    satGrad.addColorStop(0, 'white');
    satGrad.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    svCtx.fillStyle = satGrad;
    svCtx.fillRect(0, 0, width, height);

    const valGrad = svCtx.createLinearGradient(0, 0, 0, height);
    valGrad.addColorStop(0, 'rgba(0,0,0,0)');
    valGrad.addColorStop(1, 'rgba(0,0,0,1)');
    svCtx.fillStyle = valGrad;
    svCtx.fillRect(0, 0, width, height);
}

function drawHueSlider() {
    const grad = hueCtx.createLinearGradient(0, 0, hueCanvas.width, 0);
    for (let i = 0; i <= 360; i += 60) {
        grad.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    hueCtx.fillStyle = grad;
    hueCtx.fillRect(0, 0, hueCanvas.width, hueCanvas.height);
}

function updatePointer() {
    const s = parseFloat(sInput.value) / 100;
    const v = parseFloat(vInput.value) / 100;

    const w = svCanvas.width;
    const h = svCanvas.height;
    const radius = 6;

    let x = s * w;
    let y = (1 - v) * h;

    x = Math.max(radius, Math.min(w - radius, x));
    y = Math.max(radius, Math.min(h - radius, y));

    const pointer = document.getElementById('canvasPointer');
    pointer.style.left = `${x}px`;
    pointer.style.top = `${y}px`;
}

function updateHueIndicator(hue) {
    const x = (hue / 360) * hueCanvas.width;
    hueIndicator.style.left = `${x}px`;
}

function updateInputs(h, s, v, r, g, b) {
    rInput.value = Math.round(r);
    gInput.value = Math.round(g);
    bInput.value = Math.round(b);
    hInput.value = Math.round(h);
    sInput.value = Math.round(s * 100);
    vInput.value = Math.round(v * 100);
}

function updateColorPreview(h, s, v) {
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    colorPreview.style.backgroundColor = hex;
    hexValue.value = hex.substring(1);
    return hex;
}

/* ===== 色の追加・削除 ===== */

function addColorToPalette(hex, save = true) {
    const box = document.createElement('div');
    box.className = 'color-box';

    const copiedLabel = document.createElement('div');
    copiedLabel.className = 'copied-label';
    copiedLabel.textContent = 'コピーしました';

    const sample = document.createElement('div');
    sample.className = 'color-sample';
    sample.style.backgroundColor = hex;

    const label = document.createElement('div');
    label.className = 'hex-label';
    label.textContent = hex;

    sample.addEventListener('click', () => {
        navigator.clipboard.writeText(hex).then(() => showCopyNotice(hex));

        const { r, g, b } = hexToRgb(hex);
        const [h, s, v] = rgbToHsv(r, g, b);
        currentHue = h;

        drawSVCanvas(h);
        updateHueIndicator(h);
        updateInputs(h, s, v, r, g, b);
        updateColorPreview(h, s, v);
        updatePointer();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = () => {
        palette.removeChild(box);
        removeFromStorage(hex);
    };

    box.appendChild(deleteBtn);
    box.appendChild(sample);
    box.appendChild(label);
    box.appendChild(copiedLabel);
    palette.appendChild(box);

    if (save) saveColor(hex);
}

function saveColor(hex) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!existing.includes(hex)) {
        existing.push(hex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
}

function showCopyNotice(hex) {
    const boxes = document.querySelectorAll('.color-box');
    boxes.forEach(box => {
        const label = box.querySelector('.hex-label');
        if (label && label.textContent === hex) {
            box.classList.add('copied');
            setTimeout(() => box.classList.remove('copied'), 1000);
        }
    });
}

function loadSavedColors() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.forEach(hex => addColorToPalette(hex, false));
}

function removeFromStorage(hex) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter(h => h !== hex);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/* ===== イベントの設定 ===== */

function updateFromHexInput() {
    const hex = '#' + hexValue.value.trim();
    if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) return;

    const { r, g, b } = hexToRgb(hex);
    const [h, s, v] = rgbToHsv(r, g, b);
    drawSVCanvas(h);
    updateHueIndicator(h);
    updateInputs(h, s, v, r, g, b);
    updateColorPreview(h, s, v);
    updatePointer();
}

function updateFromRGBInputs() {
    const r = +rInput.value, g = +gInput.value, b = +bInput.value;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return;

    const [h, s, v] = rgbToHsv(r, g, b);
    drawSVCanvas(h);
    updateHueIndicator(h);
    updateInputs(h, s, v, r, g, b);
    updateColorPreview(h, s, v);
    updatePointer();
}

function updateFromHSVInputs() {
    const h = +hInput.value;
    const s = +sInput.value / 100;
    const v = +vInput.value / 100;
    if (isNaN(h) || isNaN(s) || isNaN(v)) return;

    drawSVCanvas(h);
    updateHueIndicator(h);
    const [r, g, b] = hsvToRgb(h, s, v);
    updateInputs(h, s, v, r, g, b);
    updateColorPreview(h, s, v);
    updatePointer();
}

hexValue.addEventListener('input', updateFromHexInput);
[rInput, gInput, bInput].forEach(input =>
    input.addEventListener('input', updateFromRGBInputs)
);
[hInput, sInput, vInput].forEach(input =>
    input.addEventListener('input', updateFromHSVInputs)
);

document.getElementById('addHexBtn').addEventListener('click', () => {
    const hex = '#' + hexValue.value.trim();
    if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
        animateErrorFeedback(document.getElementById('addHexBtn'), 'fa-plus');
        return;
    }
    const { r, g, b } = hexToRgb(hex);
    const [h, s, v] = rgbToHsv(r, g, b);
    currentHue = h;
    updateInputs(h, s, v, r, g, b);
    if ([...palette.querySelectorAll('.hex-label')].some(label => label.textContent === hex)) {
        animateErrorFeedback(document.getElementById('addHexBtn'), 'fa-plus');
        return;
    } else {
        addColorToPalette(hex, true);
        animateAddFeedback(document.getElementById('addHexBtn'));
    }
});

document.getElementById('addRgbBtn').addEventListener('click', () => {
    const r = parseInt(rInput.value);
    const g = parseInt(gInput.value);
    const b = parseInt(bInput.value);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        animateErrorFeedback(document.getElementById('addRgbBtn'), 'fa-plus');
        return;
    }
    const [h, s, v] = rgbToHsv(r, g, b);
    currentHue = h;
    const hex = rgbToHex(r, g, b)
    if ([...palette.querySelectorAll('.hex-label')].some(label => label.textContent === hex)) {
        animateErrorFeedback(document.getElementById('addRgbBtn'), 'fa-plus');
        return;
    } else {
        addColorToPalette(hex, true);
        animateAddFeedback(document.getElementById('addRgbBtn'));
    }
});

document.getElementById('addHsvBtn').addEventListener('click', () => {
    const h = parseFloat(hInput.value);
    const s = parseFloat(sInput.value) / 100;
    const v = parseFloat(vInput.value) / 100;
    if (isNaN(h) || isNaN(s) || isNaN(v)) {
        animateErrorFeedback(document.getElementById('addHsvBtn'), 'fa-plus');
        return;
    }
    currentHue = h;
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b)

    if ([...palette.querySelectorAll('.hex-label')].some(label => label.textContent === hex)) {
        animateErrorFeedback(document.getElementById('addHsvBtn'), 'fa-plus');
        return;
    } else {
        addColorToPalette(hex, true);
        animateAddFeedback(document.getElementById('addHsvBtn'));
    }
});

document.getElementById('copyHexBtn').addEventListener('click', () => {
    const hex = '#' + hexValue.value.trim();
    if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
        animateErrorFeedback(document.getElementById('copyHexBtn'), 'fa-copy');
        return;
    } else {
        navigator.clipboard.writeText(hex).then(() => {
            animateCopyFeedback(document.getElementById('copyHexBtn'));
        });
    }
});

document.getElementById('copyRgbBtn').addEventListener('click', () => {
    const r = rInput.value;
    const g = gInput.value;
    const b = bInput.value;

    if (isBlank(r) || isBlank(g) || isBlank(b)) {
        animateErrorFeedback(document.getElementById('copyRgbBtn'), 'fa-copy');
        return;
    } else {
        const rgbText = `rgb(${r}, ${g}, ${b})`;
        navigator.clipboard.writeText(rgbText).then(() => {
            animateCopyFeedback(document.getElementById('copyRgbBtn'));
        });
    }
});

document.getElementById('copyHsvBtn').addEventListener('click', () => {
    const h = hInput.value;
    const s = sInput.value;
    const v = vInput.value;

    if (isBlank(h) || isBlank(s) || isBlank(v)) {
        animateErrorFeedback(document.getElementById('copyHsvBtn'), 'fa-copy');
        return;
    } else {
        const hsvText = `hsv(${h}, ${s}, ${v})`;
        navigator.clipboard.writeText(hsvText).then(() => {
            animateCopyFeedback(document.getElementById('copyHsvBtn'));
        });
    }
});

/* ===== パレットの生成と整列 ===== */

function colorDistanceHSV(a, b) {
    const hueDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180;
    const satDiff = a.s - b.s;
    const valDiff = a.v - b.v;

    // H > V > S の順番で優先
    const weightH = 2.0, weightS = 1.0, weightV = 1.5;

    return Math.sqrt(
        weightH * hueDiff * hueDiff +
        weightS * satDiff * satDiff +
        weightV * valDiff * valDiff
    );
}

function generateUniqueColors(hue, count = 5, minDistance = 0.2) {
    const results = [];
    let attempts = 0, maxAttempts = 20 * count;

    while (results.length < count && attempts < maxAttempts) {
        attempts++;

        const s = Math.random() * 0.5 + 0.5;
        const v = Math.random() * 0.3 + 0.7;
        const newColor = { h: hue, s, v };
        if (!results.some(existing => colorDistanceHSV(newColor, existing) < minDistance)) {
            results.push(newColor);
        }
    }

    //TODO 5色未満でも一旦放置
    // if (results.length < count) {
    //     console.warn(`Only ${results.length} unique colors could be generated.`);
    // }

    return results;
}

/* ===== パレットの並び替え ===== */

function sortPaletteByLab() {
    const boxes = Array.from(document.querySelectorAll('.color-box'));
    if (boxes.length < 2) return;
    const labBoxes = boxes.map(box => {
        const hex = box.querySelector('.hex-label')?.textContent;
        const rgb = hexToRgb(hex);
        const xyz = rgbToXyz(rgb);
        const lab = xyzToLab(xyz);
        return { box, lab, hex };
    });

    const sorted = [];
    const used = new Set();
    let current = labBoxes[0]; sorted.push(current); used.add(current);


    while (sorted.length < labBoxes.length) {
        let minDist = Infinity;
        let next = null;

        for (const candidate of labBoxes) {
            if (used.has(candidate)) continue;
            const dist = deltaE(current.lab, candidate.lab);
            if (dist < minDist) {
                minDist = dist;
                next = candidate;
            }
        }

        if (next) {
            sorted.push(next);
            used.add(next);
            current = next;
        }
    }

    palette.innerHTML = '';
    sorted.forEach(({ box }) => palette.appendChild(box));
    const sortedHexList = sorted.map(item => item.hex);
    saveSortedPaletteToStorage(sortedHexList);
}

function saveSortedPaletteToStorage(hexList) {
    if (!Array.isArray(hexList) || hexList.some(h => typeof h !== 'string')) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hexList));
}

/* ===== パレットの重複の削除 ===== */

function removeSimilarColorsFromPalette(threshold = 10) {
    const boxes = Array.from(document.querySelectorAll('.color-box'));
    if (boxes.length < 2) return;

    // 色をLab空間に変換
    const labBoxes = boxes.map(box => {
        const hex = box.querySelector('.hex-label')?.textContent;
        const rgb = hexToRgb(hex);
        const xyz = rgbToXyz(rgb);
        const lab = xyzToLab(xyz);
        return { box, lab, hex };
    });

    const toRemove = new Set();
    for (let i = 0; i < labBoxes.length; i++) {
        if (toRemove.has(labBoxes[i].box)) continue;
        for (let j = i + 1; j < labBoxes.length; j++) {
            if (toRemove.has(labBoxes[j].box)) continue;
            const dE = deltaE(labBoxes[i].lab, labBoxes[j].lab);
            if (dE < threshold) {
                // j番目を類似色とみなし削除対象
                toRemove.add(labBoxes[j].box);
            }
        }
    }

    // DOMとlocalStorageから削除
    toRemove.forEach(box => {
        const hex = box.querySelector('.hex-label').textContent;
        box.parentNode.removeChild(box);
        removeFromStorage(hex); // 既存関数
    });
}

document.getElementById('sortPaletteLabBtn').addEventListener('click', sortPaletteByLab);

document.getElementById('killPaletteBtn').addEventListener('click', function () {
    const thresholdInput = document.getElementById('threshold');
    let threshold = parseFloat(thresholdInput.value);
    if (isNaN(threshold) || threshold < 1) threshold = 7;
    removeSimilarColorsFromPalette(threshold);
});

/* ===== 色追加ボタン ===== */

document.querySelectorAll('#rainbowButtons button').forEach(btn => {
    btn.addEventListener('click', () => {
        const hue = parseFloat(btn.dataset.hue);
        currentHue = hue;
        drawSVCanvas(hue);
        updatePointer();
        updateHueIndicator(hue);
        const colors = generateUniqueColors(hue, 5, 0.2);
        colors.forEach(({ h, s, v }) => {
            const hex = updateColorPreview(h, s, v);
            addColorToPalette(hex);
        });

    });
});

clearButton.addEventListener('click', () => {
    if (confirm('本当にすべての色を削除しますか？')) {
        palette.innerHTML = '';
        localStorage.removeItem(STORAGE_KEY);
    }
});

/* ===== SV/Hueキャンバス操作 ===== */

hueCanvas.addEventListener('click', e => {
    const rect = hueCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hue = (x / hueCanvas.width) * 360;
    currentHue = hue;
    drawSVCanvas(hue);
    updateHueIndicator(hue);
});

//クリック中かどうかを判断する
let isDraggingHue = false;

hueCanvas.addEventListener('mousedown', e => {
    isDraggingHue = true;
    updateHueFromEvent(e);
});

hueCanvas.addEventListener('mouseup', e => {
    isDraggingHue = false;
});

hueCanvas.addEventListener('mouseleave', e => {
    isDraggingHue = false;
});

hueCanvas.addEventListener('mousemove', e => {
    if (!isDraggingHue) return; // クリック中のみ処理
    updateHueFromEvent(e);
});

function updateHueFromEvent(e) {
    const rect = hueCanvas.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), hueCanvas.width);
    const hue = (x / hueCanvas.width) * 360;
    currentHue = hue;
    drawSVCanvas(hue);
    updateHueIndicator(hue);
}

svCanvas.addEventListener('click', e => {
    const rect = svCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = x / svCanvas.width;
    const v = 1 - y / svCanvas.height;
    const hex = updateColorPreview(currentHue, s, v);
    const [r, g, b] = hsvToRgb(currentHue, s, v);
    updateInputs(currentHue, s, v, r, g, b);
    addColorToPalette(hex);
});

svCanvas.addEventListener('mousemove', e => {
    const rect = svCanvas.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), svCanvas.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), svCanvas.height);
    const s = x / svCanvas.width;
    const v = 1 - y / svCanvas.height;
    updateColorPreview(currentHue, s, v);
    updatePointer();
});

let isDragging = false;

svCanvas.addEventListener('mousedown', (e) => {
    isDragging = true;

    const rect = svCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    movePointer(x, y);
});

svCanvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const rect = svCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    movePointer(x, y);
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function movePointer(x, y) {
    const pointer = document.getElementById('canvasPointer');

    const clampedX = Math.min(Math.max(x, 0), svCanvas.width);
    const clampedY = Math.min(Math.max(y, 0), svCanvas.height);

    pointer.style.left = `${clampedX}px`;
    pointer.style.top = `${clampedY}px`;
}

/* ===== RGB/HSV 入力値補正 ===== */

document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        let value = parseFloat(input.value);

        if (isNaN(value)) return;

        // 最小・最大値で制限
        if (value < min) input.value = min;
        if (value > max) input.value = max;

        //プレビュー用の再計算
        if ([rInput, gInput, bInput].includes(input)) {
            updateFromRGBInputs();
        } else if ([hInput, sInput, vInput].includes(input)) {
            updateFromHSVInputs();
        }
    });
});

document.getElementById('dropperBtn').addEventListener('click', async () => {
    if (!window.EyeDropper) {
        alert("このブラウザは EyeDropper API に対応していないため、この機能は使用できません。");
        return;
    }
    try {
        const dropper = new EyeDropper();
        const { sRGBHex } = await dropper.open();
        addColorToPalette(sRGBHex, true);
    } catch (err) {
        //APIが対応している前提なので握りつぶす
    }
});