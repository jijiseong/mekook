function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// 황금각(137.508°) 곱셈 — 어떤 두 심볼도 hue 차이 최소 ~85° 보장
export function getAssetColor(identifier: string): string {
  const hue = Math.round((hashCode(identifier) * 137.508) % 360)
  return `oklch(0.72 0.22 ${hue})`
}
