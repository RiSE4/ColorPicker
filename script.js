const svCanvas = document.getElementById('svCanvas');
const hueCanvas = document.getElementById('hueCanvas');
const svCtx = svCanvas.getContext('2d');
const hueCtx = hueCanvas.getContext('2d');
const colorPreview = document.getElementById('colorPreview');
const hexValue = document.getElementById('hexValue');
const palette = document.getElementById('palette');
const clearButton = document.getElementById('clearPaletteBtn');
const STORAGE_KEY = 'colorPalette';

let currentHue = 0;

const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');
const hInput = document.getElementById('hInput');
const sInput = document.getElementById('sInput');
const vInput = document.getElementById('vInput');

function updateFromRGBInputs() {
    const r = +rInput.value, g = +gInput.value, b = +bInput.value;
    const [h, s, v] = rgbToHsv(r, g, b);
    currentHue = h;
    drawSVCanvas(currentHue);
    updateSVIndicatorFromHSV(h, s, v);
    updateInputs(h, s, v, r, g, b);
    updateColorPreview(h, s, v);
}

function updateFromHSVInputs() {
    const h = +hInput.value;
    const s = +sInput.value / 100;
    const v = +vInput.value / 100;
    currentHue = h;
    drawSVCanvas(h);
    updateSVIndicatorFromHSV(h, s, v);
    updateInputs(h, s, v, ...hsvToRgb(h, s, v));
    updateColorPreview(h, s, v);
}

[rInput, gInput, bInput].forEach(input =>
    input.addEventListener('input', updateFromRGBInputs)
);

[hInput, sInput, vInput].forEach(input =>
    input.addEventListener('input', updateFromHSVInputs)
);

function updateInputs(h, s, v, r, g, b) {
    rInput.value = Math.round(r);
    gInput.value = Math.round(g);
    bInput.value = Math.round(b);
    hInput.value = Math.round(h);
    sInput.value = Math.round(s * 100);
    vInput.value = Math.round(v * 100);
}

const hueIndicator = document.getElementById('hueIndicator');

function updateHueIndicator(hue) {
    const x = (hue / 360) * hueCanvas.width;
    hueIndicator.style.left = `${x}px`;
}

// HSV → RGB変換
function hsvToRgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [
        Math.round(f(5) * 255),
        Math.round(f(3) * 255),
        Math.round(f(1) * 255)
    ];
}

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;

    let d = max - min;
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


function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x =>
        x.toString(16).padStart(2, '0')
    ).join('').toUpperCase();
}

function drawHueSlider() {
    const grad = hueCtx.createLinearGradient(0, 0, hueCanvas.width, 0);
    for (let i = 0; i <= 360; i += 60) {
        grad.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    hueCtx.fillStyle = grad;
    hueCtx.fillRect(0, 0, hueCanvas.width, hueCanvas.height);
}

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

function updateColorPreview(h, s, v) {
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    colorPreview.style.backgroundColor = hex;
    hexValue.textContent = hex;
    return hex;
}

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
        navigator.clipboard.writeText(hex).then(() => {
            showCopyNotice(hex);
        });
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

function saveColor(hex) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!existing.includes(hex)) {
        existing.push(hex);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
}

function removeFromStorage(hex) {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter(h => h !== hex);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function loadSavedColors() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved.forEach(hex => addColorToPalette(hex, false));
}

// イベント設定
hueCanvas.addEventListener('click', e => {
    const rect = hueCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hue = (x / hueCanvas.width) * 360;
    currentHue = hue;
    drawSVCanvas(hue);
    updateHueIndicator(hue);
});

svCanvas.addEventListener('click', e => {
    const rect = svCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = x / svCanvas.width;
    const v = 1 - y / svCanvas.height;

    const hex = updateColorPreview(currentHue, s, v);
    addColorToPalette(hex);
});

svCanvas.addEventListener('mousemove', e => {
    const rect = svCanvas.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), svCanvas.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), svCanvas.height);

    const s = x / svCanvas.width;
    const v = 1 - y / svCanvas.height;

    updateColorPreview(currentHue, s, v);
    // updateSVIndicatorFromHSV(currentHue, s, v);
    updateInputs(currentHue, s, v, ...hsvToRgb(currentHue, s, v));
});

let isDraggingHue = false; // クリック中かどうかを管理するフラグ

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
    if (!isDraggingHue) return;  // クリック中のみ処理
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



clearButton.addEventListener('click', () => {
    if (confirm('本当にすべての色を削除しますか？')) {
        palette.innerHTML = '';
        localStorage.removeItem(STORAGE_KEY);
    }
});

// 初期化
drawHueSlider();
drawSVCanvas(currentHue);
loadSavedColors();
