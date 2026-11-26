// 기후에너지환경부 「분리의 정석」(wasteguide.or.kr) 품목사전을 천천히 받아 JSON으로 정리한다.
import fs from 'fs';
const OUT = process.argv[2];
const BASE = 'https://wasteguide.or.kr/front/dischargeMethod/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { 'User-Agent': 'Mozilla/5.0 (student project woori-recycle-helper)' };

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
      if (r.ok) return await r.text();
    } catch {}
    await sleep(1500 * (i + 1));
  }
  return null;
}
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
function section(html, title) {
  const re = new RegExp(`<div class="btit[^"]*">${title}[\\s\\S]*?</div>\\s*<div>([\\s\\S]*?)</div>`);
  const m = html.match(re);
  return m ? clean(m[1]) : '';
}
function parseDetail(id, html) {
  // 페이지 머리글에도 class="tit"가 있어, 품목 본문(.txt) 안의 것만 잡는다
  const name = clean((html.match(/<div class="txt">\s*<div class="tit">([\s\S]*?)<\/div>/) || [])[1] || '');
  const cls = (html.match(/<div class="classification">([\s\S]*?)<\/div>/) || [])[1] || '';
  const path = [...cls.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((m) => clean(m[1])).filter(Boolean);
  const typeBlock = (html.match(/유사검색어<\/dt>[\s\S]*?<div class="type">([\s\S]*?)<\/div>/) || [])[1] || '';
  const synonyms = [...typeBlock.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((m) => clean(m[1])).filter(Boolean);
  return { id, name, path, how: section(html, '배출방법'), feature: section(html, '특징'), caution: section(html, '유의사항'), synonyms };
}

fs.mkdirSync(OUT, { recursive: true });
const ids = new Set();
for (let p = 1; p <= 98; p++) {
  const html = await get(`${BASE}dictionary.do?pageIndex=${p}&searchCnd=1`);
  if (html) for (const m of html.matchAll(/fnViewArticle\('(\d+)'\)/g)) ids.add(m[1]);
  await sleep(250);
}
console.log('ids', ids.size);
const list = [...ids];
const items = [];
let done = 0;
async function worker() {
  while (list.length) {
    const id = list.shift();
    const html = await get(`${BASE}dictionaryView.do?niIdx=${id}`);
    if (html) items.push(parseDetail(id, html));
    done++;
    if (done % 100 === 0) console.log('done', done);
    await sleep(250);
  }
}
await Promise.all([worker(), worker(), worker()]);
items.sort((a, b) => Number(a.id) - Number(b.id));
fs.writeFileSync(`${OUT}/items.json`, JSON.stringify(items, null, 1));
console.log('saved', items.length, 'with how', items.filter((i) => i.how).length);
