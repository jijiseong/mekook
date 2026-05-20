const TOTAL = 5

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getAssetColor(identifier: string): string {
  return `var(--color-chart-${(hashCode(identifier) % TOTAL) + 1})`
}
