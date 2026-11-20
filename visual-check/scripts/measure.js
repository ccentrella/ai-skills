import { chromium } from 'playwright';

const [url, selA, selB] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url);

const result = await page.evaluate(([a, b]) => {
    const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
            x: r.x, y: r.y, w: r.width, h: r.height,
            margin: cs.margin, padding: cs.padding, gap: cs.gap, fontSize: cs.fontSize,
        };
    };
    const A = box(a);
    const B = b ? box(b) : null;
    const out = { a: A };
    if (B) {
        out.b = B;
        out.verticalGap = B.y - (A.y + A.h);
        out.horizontalGap = B.x - (A.x + A.w);
    }
    return out;
}, [selA, selB]);

console.log(JSON.stringify(result));
await browser.close();