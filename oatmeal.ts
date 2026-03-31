import fs from 'fs';
import * as cheerio from 'cheerio';

// Source - https://stackoverflow.com/a/39914235
// Posted by Dan Dascalescu, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-07, License - CC BY-SA 4.0
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TARGET_URL = 'https://theoatmeal.com/blog/spooky_comics';

if (!fs.existsSync('./cache')) {
    fs.mkdirSync('./cache');
}

const cacheFile = './cache/spooky_comics.html';

let html = '';
if (fs.existsSync(cacheFile)) {
    html = fs.readFileSync(cacheFile, { encoding: 'utf-8' });
} else {
    await sleep(1000);
    const res = await fetch(TARGET_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OatmealScraper/1.0)' }
    });
    html = await res.text();
    fs.writeFileSync(cacheFile, html);
}

const $ = cheerio.load(html);

const SKIP = ['/default/', '/thumbnails/', 'logo', 'header', 'amazon'];

$('a').each((_, a) => {
    const link = $(a).attr('href') ?? '';
    if (!/theoatmeal\.com\/(comics|blog)\/\w+/.test(link)) return;

    const img = $(a).find('img');
    if (!img.length) return;

    const src = img.attr('src') ?? '';
    if (SKIP.some(p => src.includes(p))) return;
    if (!/\.(png|jpe?g|gif|webp)$/i.test(src)) return;

    console.log(src);
    console.log(link);
    console.log(img.attr('alt') ?? '');
    console.log('---');
});
