// 「분리의 정석」 품목사전(items.json)을 앱의 catalog.json으로 바꾼다.
// - 음식물·농약·방사성·공사장 등 앱 범위 밖 분류는 뺀다
// - 앱이 직접 다루는 품목(data/items.json)과 이름이 같으면 뺀다
// - "이름(재질)" 형태의 항목은 하나로 합치고 재질 질문을 붙인다
import fs from 'fs';
const [srcPath, appItemsPath, outPath] = process.argv.slice(2);
const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const appItems = JSON.parse(fs.readFileSync(appItemsPath, 'utf8'));
const norm = (s) => s.replace(/\s+/g, '').toLowerCase();
const taken = new Set(appItems.flatMap((i) => [i.name, ...i.aliases]).map(norm));

const CAT = {
  일반종량제폐기물: 'general', 불연성종량제폐기물: 'nonburn',
  '합성수지 용기류': 'plastic', 'PET, PP, PS, PE, OTHER': 'plastic', '합성수지 비닐류': 'vinyl',
  고철: 'scrap', 금속류: 'scrap', 금속캔: 'can', 기타캔류: 'can',
  종이: 'paper', 종이팩: 'paperpack', 일반팩: 'paperpack', 멸균팩: 'paperpack',
  유리병: 'glass', '빈용기보증금 대상 유리병': 'glass', 무색페트병: 'pet',
  '발포합성수지(스티로폼 등)': 'styro', 의류: 'clothes', 전지류: 'battery',
  조명제품: 'lamp', 형광등: 'lamp', '전기전자 제품류': 'ewaste', 대형폐기물: 'bulky', 폐의약품: 'medicine',
};
const GROUP = {
  general: '일반 쓰레기', nonburn: '불연성(마대)', plastic: '재활용품', vinyl: '재활용품', scrap: '재활용품', can: '재활용품',
  paper: '재활용품', paperpack: '재활용품', glass: '유리', pet: '재활용품', styro: '재활용품', clothes: '생활용품',
  battery: '유해폐기물', lamp: '유해폐기물', 'ewaste-small': '소형가전', 'ewaste-large': '대형가전', bulky: '대형폐기물', medicine: '유해폐기물',
};
function category(entry) {
  if (entry.path[0] === '음식물류폐기물') return null;
  for (let i = entry.path.length - 1; i >= 0; i--) {
    const c = CAT[entry.path[i]];
    if (c === 'ewaste') return /수거함/.test(entry.how) ? 'ewaste-small' : 'ewaste-large';
    if (c) return c;
  }
  if (entry.path.length === 1 && entry.path[0] === '일반폐기물') return 'general';
  return null;
}
const sentences = (text) => text.split('·').map((s) => s.trim()).filter(Boolean);

const groups = new Map();
let skipped = 0;
for (const e of src) {
  const cat = category(e);
  if (!cat) { skipped++; continue; }
  const m = e.name.match(/^(.*?)\s*\((.+)\)\s*$/);
  const base = m ? m[1].trim() : e.name.trim();
  if (taken.has(norm(base)) || taken.has(norm(e.name))) { skipped++; continue; }
  const route = { cat, niIdx: Number(e.id), label: m ? m[2].trim() : null, notes: [...sentences(e.how), ...sentences(e.caution)] };
  const key = m ? norm(base) : norm(e.name);
  if (!groups.has(key)) groups.set(key, { base, routes: [] });
  groups.get(key).routes.push(route);
}

const COUNT_Q = { id: 'count', shortLabel: '함께 버리는 가전', text: '소형가전을 5개 이상 버리거나, 냉장고 같은 대형 가전과 함께 버리나요?', options: [{ id: 'five-plus', label: '소형가전 5개 이상' }, { id: 'with-large', label: '대형 가전과 함께' }, { id: 'under-five', label: '둘 다 아님' }] };
const out = [];
for (const { base, routes } of groups.values()) {
  // 같은 이름이 괄호 없이 하나만 있으면 단일 품목, 재질별로 여럿이면 재질 질문
  const variants = routes.filter((r) => r.label);
  const plain = routes.filter((r) => !r.label);
  let item;
  if (variants.length >= 2 && plain.length === 0) {
    const options = variants.map((r, i) => ({ id: `v${i + 1}`, label: r.label }));
    item = {
      id: `wg-${variants[0].niIdx}`, name: base, group: GROUP[variants[0].cat],
      questions: [{ id: 'variant', shortLabel: '재질', text: `${base}의 재질은 무엇인가요?`, options }],
      routes: variants.map((r, i) => ({ when: { variant: `v${i + 1}` }, cat: r.cat, niIdx: r.niIdx, notes: r.notes })),
    };
  } else {
    // 괄호 항목이 하나뿐이거나 괄호 없는 항목이 있으면 각각 별도 품목으로 둔다
    for (const r of routes) {
      const name = r.label ? `${base}(${r.label})` : base;
      out.push({ id: `wg-${r.niIdx}`, name, group: GROUP[r.cat], questions: [], routes: [{ when: {}, cat: r.cat, niIdx: r.niIdx, notes: r.notes }] });
    }
    continue;
  }
  out.push(item);
}
// 소형 전자제품은 기존 소형가전처럼 개수 질문을 붙인다
for (const item of out) {
  if (item.routes.some((r) => r.cat === 'ewaste-small')) item.questions = [...item.questions, COUNT_Q];
}
// 냄비 뚜껑: 품목사전에는 '냄비뚜껑(내열)'(불연성)만 있어, '냄비'(고철) 항목과 묶어 재질 질문을 만든다
const lidSrc = src.find((e) => e.name === '냄비뚜껑(내열)');
const potSrc = src.find((e) => e.name === '냄비');
const withoutLid = out.filter((i) => i.name !== '냄비뚜껑(내열)');
if (lidSrc && potSrc) {
  withoutLid.push({
    id: 'pot-lid', name: '냄비 뚜껑', aliases: ['냄비뚜껑', '유리뚜껑', '유리 뚜껑', '솥뚜껑', '팬 뚜껑', '프라이팬 뚜껑'], group: '주방용품',
    questions: [{ id: 'material', shortLabel: '뚜껑 재질', text: '뚜껑은 어떤 재질인가요?', options: [{ id: 'glass', label: '유리(내열유리)' }, { id: 'metal', label: '금속(스테인리스·알루미늄·철)' }] }],
    routes: [
      { when: { material: 'glass' }, cat: 'nonburn', niIdx: Number(lidSrc.id), notes: [...sentences(lidSrc.how), ...sentences(lidSrc.caution)] },
      { when: { material: 'metal' }, cat: 'scrap', niIdx: Number(potSrc.id), notes: ['금속 냄비 뚜껑은 냄비와 같이 고철 수거함으로 배출해요.', ...sentences(potSrc.caution)] },
    ],
  });
}
// 같은 이름 중복 제거
const seen = new Set();
const final = withoutLid.filter((i) => (seen.has(norm(i.name)) ? false : (seen.add(norm(i.name)), true)));
final.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
fs.writeFileSync(outPath, JSON.stringify(final) + '\n');
const byCat = {};
for (const i of final) for (const r of i.routes) byCat[r.cat] = (byCat[r.cat] || 0) + 1;
console.log('catalog items', final.length, 'skipped entries', skipped, 'merged', final.filter((i) => i.questions.some((q) => q.id === 'variant')).length, byCat);
