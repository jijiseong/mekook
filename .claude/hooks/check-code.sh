#!/usr/bin/env bash
# PostToolUse hook: format + lint + typecheck after Edit/Write/MultiEdit.
# Exits 2 with stderr feedback on failure so Claude can auto-correct.
set -uo pipefail

# Project root = parent of .claude/
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

input="$(cat)"
file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')"

# No file path → nothing to do
[ -z "$file" ] && exit 0

# Normalize to absolute path
case "$file" in
  /*) ;;
  *) file="$ROOT/$file" ;;
esac

# Outside project → ignore
case "$file" in
  "$ROOT"/*) ;;
  *) exit 0 ;;
esac

# Skip if file no longer exists (e.g., deleted)
[ -f "$file" ] || exit 0

# Filter by extension
ext="${file##*.}"
case "$ext" in
  ts|tsx|js|jsx|css|json|md) ;;
  *) exit 0 ;;
esac

errors=""

# 1. Prettier (--write) on the file
if ! out=$(pnpm exec prettier --write --log-level warn "$file" 2>&1); then
  errors+="[Prettier]
$out

"
fi

# 2. ESLint (--fix) for JS/TS only
case "$ext" in
  ts|tsx|js|jsx)
    if ! out=$(pnpm exec eslint --fix "$file" 2>&1); then
      errors+="[ESLint]
$out

"
    fi
    ;;
esac

# 3. TypeScript project-wide typecheck for TS only
case "$ext" in
  ts|tsx)
    if ! out=$(pnpm exec tsc -b --noEmit 2>&1); then
      errors+="[TypeScript]
$out

"
    fi
    ;;
esac

if [ -n "$errors" ]; then
  printf '%s' "$errors" >&2
  exit 2
fi
exit 0
