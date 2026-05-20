function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getAssetColor(identifier: string): string {
  const hue = hashCode(identifier) % 360
  return `oklch(0.72 0.18 ${hue})`
}
