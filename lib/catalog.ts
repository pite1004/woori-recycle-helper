import type { DisposalRule, Item, Question, RegionCode } from "./types";

/**
 * 「분리의 정석」(기후에너지환경부 생활폐기물 분리배출 누리집) 품목사전에서 가져온 품목.
 * 품목마다 규칙을 모두 저장하면 데이터가 너무 커져서, 분류(cat)만 저장하고
 * 배출 일정·봉투·장소는 같은 분류의 구청 공식 규칙(TEMPLATES)에서 가져와 규칙을 만든다.
 */
export type CatalogCategory =
  | "general"
  | "nonburn"
  | "plastic"
  | "vinyl"
  | "scrap"
  | "can"
  | "paper"
  | "paperpack"
  | "glass"
  | "pet"
  | "styro"
  | "clothes"
  | "battery"
  | "lamp"
  | "ewaste-small"
  | "ewaste-large"
  | "bulky"
  | "medicine";

export type CatalogRoute = {
  when: Record<string, string>;
  cat: CatalogCategory;
  /** 품목사전 글 번호 */
  niIdx: number;
  /** 품목사전의 배출방법·유의사항 원문 */
  notes: string[];
};

export type CatalogItem = {
  id: string;
  name: string;
  aliases?: string[];
  group: string;
  questions: Question[];
  routes: CatalogRoute[];
};

type Template = {
  /** 일정·봉투·장소를 가져올 구청 공식 규칙 id */
  base: string;
  method?: string;
  bagOrSticker?: string;
  /** 대형폐기물처럼 품목마다 금액이 다르면 null로 덮어쓴다 */
  cost?: { costWon: number | null; costNote: string };
  /**
   * 틀 규칙의 주의사항 중 이 분류 전체에 맞는 것의 위치. 생략하면 모두 옮긴다.
   * 특정 품목에만 맞는 문구(예: 프라이팬 기준)는 빼야 한다.
   */
  keep?: number[];
};

type RegionTemplates = Record<RegionCode, Template[]>;

const BULKY_COST = {
  costWon: null,
  costNote: "품목·규격별 수수료는 신고할 때 확인해 주세요.",
};

/** 분류별로 어떤 구청 규칙의 일정을 쓸지. 소형 전자제품은 개수 질문에 따라 규칙이 3개다. */
const TEMPLATES: Record<Exclude<CatalogCategory, "medicine">, RegionTemplates> = {
  general: {
    "incheon-michuhol": [{ base: "mh-frying-pan-bag", keep: [] }],
    "incheon-yeonsu": [{ base: "ys-frying-pan-bag", keep: [] }],
  },
  nonburn: { "incheon-michuhol": [{ base: "mh-broken-glass-pp" }], "incheon-yeonsu": [{ base: "ys-broken-glass-pp" }] },
  plastic: {
    "incheon-michuhol": [{ base: "mh-plastic-container-recycle", keep: [1, 2] }],
    "incheon-yeonsu": [{ base: "ys-plastic-container-recycle", keep: [0] }],
  },
  vinyl: {
    "incheon-michuhol": [{ base: "mh-vinyl-recycle" }],
    "incheon-yeonsu": [{ base: "ys-vinyl-recycle", keep: [1] }],
  },
  scrap: {
    "incheon-michuhol": [{ base: "mh-pot-metal-all-metal-stainless-iron" }],
    "incheon-yeonsu": [{ base: "ys-pot-metal-all-metal-stainless-iron", keep: [1] }],
  },
  can: { "incheon-michuhol": [{ base: "mh-can-recycle" }], "incheon-yeonsu": [{ base: "ys-can-recycle" }] },
  paper: {
    "incheon-michuhol": [{ base: "mh-box-recycle" }],
    "incheon-yeonsu": [{ base: "ys-box-recycle", method: "종이류 재활용", bagOrSticker: "끈으로 묶어 배출", keep: [0] }],
  },
  paperpack: { "incheon-michuhol": [{ base: "mh-paper-pack-recycle" }], "incheon-yeonsu": [{ base: "ys-paper-pack-recycle" }] },
  glass: { "incheon-michuhol": [{ base: "mh-glass-bottle-recycle" }], "incheon-yeonsu": [{ base: "ys-glass-bottle-recycle" }] },
  pet: { "incheon-michuhol": [{ base: "mh-pet-bottle-clear" }], "incheon-yeonsu": [{ base: "ys-pet-bottle-clear" }] },
  styro: { "incheon-michuhol": [{ base: "mh-styrofoam-recycle" }], "incheon-yeonsu": [{ base: "ys-styrofoam-recycle" }] },
  clothes: {
    "incheon-michuhol": [{ base: "mh-clothes-clothes-box" }],
    "incheon-yeonsu": [{ base: "ys-clothes-clothes-box", keep: [1, 2] }],
  },
  battery: { "incheon-michuhol": [{ base: "mh-battery-box" }], "incheon-yeonsu": [{ base: "ys-battery-box" }] },
  lamp: { "incheon-michuhol": [{ base: "mh-fluorescent-lamp-box" }], "incheon-yeonsu": [{ base: "ys-fluorescent-lamp-box" }] },
  "ewaste-small": {
    "incheon-michuhol": [
      { base: "mh-electric-kettle-box" },
      { base: "mh-electric-kettle-visit" },
      { base: "mh-electric-kettle-visit-with-large" },
    ],
    "incheon-yeonsu": [
      { base: "ys-electric-kettle-box" },
      { base: "ys-electric-kettle-visit" },
      { base: "ys-electric-kettle-visit-with-large" },
    ],
  },
  "ewaste-large": {
    "incheon-michuhol": [{ base: "mh-fridge-visit", keep: [1] }],
    "incheon-yeonsu": [{ base: "ys-fridge-visit", keep: [1] }],
  },
  bulky: {
    "incheon-michuhol": [{ base: "mh-chair-sticker", cost: BULKY_COST }],
    "incheon-yeonsu": [{ base: "ys-chair-sticker-office", cost: BULKY_COST }],
  },
};

const NEEDS_CHECK = "확인 필요";
const REGION_NAME: Record<RegionCode, string> = {
  "incheon-michuhol": "미추홀구",
  "incheon-yeonsu": "연수구",
};

function sourceUrl(niIdx: number) {
  return `https://wasteguide.or.kr/front/dischargeMethod/dictionaryView.do?niIdx=${niIdx}`;
}

/** 폐의약품은 구청 규칙이 없어 품목사전 안내만으로 만든다 */
function medicineRule(item: CatalogItem, route: CatalogRoute, region: RegionCode, index: number): DisposalRule {
  return {
    id: `${region === "incheon-michuhol" ? "mh" : "ys"}-${item.id}-${index}-medicine`,
    regionCode: region,
    itemId: item.id,
    when: route.when,
    allowed: true,
    method: "폐의약품 전용수거함",
    category: "생활계 유해폐기물",
    bagOrSticker: "필요 없음",
    days: NEEDS_CHECK,
    time: NEEDS_CHECK,
    place: NEEDS_CHECK,
    costWon: 0,
    costNote: "무료",
    cautions: [...route.notes, "수거함 위치는 행정복지센터나 가까운 약국·보건소에 문의해 주세요."],
    sourceTitle: `분리의 정석 품목사전 「${item.name}」`,
    sourceUrl: sourceUrl(route.niIdx),
    checkedAt: "2026-11-26",
  };
}

export function buildCatalogRules(
  catalog: CatalogItem[],
  baseRules: DisposalRule[],
): DisposalRule[] {
  const byId = new Map(baseRules.map((rule) => [rule.id, rule]));
  const out: DisposalRule[] = [];
  for (const item of catalog) {
    item.routes.forEach((route, index) => {
      for (const region of Object.keys(REGION_NAME) as RegionCode[]) {
        if (route.cat === "medicine") {
          out.push(medicineRule(item, route, region, index));
          continue;
        }
        for (const template of TEMPLATES[route.cat][region]) {
          const base = byId.get(template.base);
          if (!base) throw new Error(`템플릿 규칙이 없어요: ${template.base}`);
          out.push({
            ...base,
            id: `${base.id.slice(0, 2)}-${item.id}-${index}-${base.id.slice(3)}`,
            itemId: item.id,
            // 소형 전자제품만 구청 규칙의 개수 조건을 물려받는다(품목에 개수 질문이 붙어 있다).
            // 다른 분류의 틀 규칙 조건(예: 스티로폼 '깨끗함')은 이 품목의 질문이 아니므로 버린다.
            when: {
              ...(route.cat === "ewaste-small" ? base.when : {}),
              ...route.when,
            },
            allowed: true,
            method: template.method ?? base.method,
            bagOrSticker: template.bagOrSticker ?? base.bagOrSticker,
            ...(template.cost ?? {}),
            cautions: [
              ...route.notes,
              ...base.cautions.filter(
                (_, i) => template.keep === undefined || template.keep.includes(i),
              ),
              `배출 요일·시간·장소와 비용은 ${REGION_NAME[region]} 안내(${base.sourceTitle}) 기준이에요.`,
            ],
            sourceTitle: `분리의 정석 품목사전 「${item.name}」`,
            sourceUrl: sourceUrl(route.niIdx),
            checkedAt: "2026-11-26",
          });
        }
      }
    });
  }
  return out;
}

export function catalogItems(catalog: CatalogItem[]): Item[] {
  return catalog.map(({ id, name, aliases, group, questions }) => ({
    id,
    name,
    aliases: aliases ?? [],
    group,
    questions,
  }));
}
