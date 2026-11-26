/** 한 번에 보낼 수 있는 사진 수. 화면은 2장 이상을 요구하지만 서버는 1장도 받는다. */
export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 3;

/** 원본 2MB를 base64로 바꾼 길이 */
export const MAX_IMAGE_BASE64 = Math.ceil((2 * 1024 * 1024 * 4) / 3);
/** Vercel 함수 요청 본문 한도(4.5MB) 안에 들도록 전체 길이를 제한한다 */
export const MAX_TOTAL_BASE64 = 4 * 1024 * 1024;

export type ImagesCheck =
  | { ok: true; images: string[] }
  | { ok: false; status: 400 | 413 };

/** /api/recognize 입력 검사. 순수 함수라 단위 테스트로 확인한다. */
export function checkImages(value: unknown): ImagesCheck {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, status: 400 };
  }
  if (value.length > MAX_PHOTOS) return { ok: false, status: 413 };
  if (!value.every((image) => typeof image === "string" && image.length > 0)) {
    return { ok: false, status: 400 };
  }
  const images = value as string[];
  if (images.some((image) => image.length > MAX_IMAGE_BASE64)) {
    return { ok: false, status: 413 };
  }
  const total = images.reduce((sum, image) => sum + image.length, 0);
  if (total > MAX_TOTAL_BASE64) return { ok: false, status: 413 };
  return { ok: true, images };
}
