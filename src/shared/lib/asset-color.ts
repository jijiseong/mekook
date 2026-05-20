// 전체 식별자 집합을 알파벳 정렬 후 균등 배분 — N개면 360/N° 간격 보장
export function getAssetColor(
  identifier: string,
  allIdentifiers: readonly string[],
): string {
  const sorted = [...allIdentifiers].sort()
  const idx = sorted.indexOf(identifier)
  const hue = idx === -1 ? 0 : Math.round((idx / sorted.length) * 360)
  return `oklch(0.72 0.22 ${hue})`
}
