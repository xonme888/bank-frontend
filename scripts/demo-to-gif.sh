#!/usr/bin/env bash
# Playwright 산출 video.webm → docs/demo.gif 변환.
# 우선순위: gifski (작고 깨끗함) > ffmpeg (호환성).

set -euo pipefail

# 가장 최근 demo project 산출물 찾기
WEBM=$(find test-results -type f -name "video.webm" -path "*demo*" -print0 \
  | xargs -0 ls -t \
  | head -n 1 || true)

if [ -z "${WEBM:-}" ]; then
  echo "✕ video.webm 을 찾을 수 없습니다 — 먼저 npm run demo:record 실행" >&2
  exit 1
fi

mkdir -p docs
OUT="docs/demo.gif"

if command -v gifski >/dev/null 2>&1; then
  echo "→ gifski 변환: $WEBM → $OUT"
  # gifski 는 .webm 직접 못 읽음 — ffmpeg 로 png 시퀀스 추출 후 gifski 입력
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "  (ffmpeg 도 필요 — brew install ffmpeg)" >&2
    exit 1
  fi
  TMP=$(mktemp -d)
  ffmpeg -loglevel error -i "$WEBM" -vf "fps=15,scale=1280:-1:flags=lanczos" "$TMP/frame_%04d.png"
  gifski "$TMP"/frame_*.png -o "$OUT" --fps 15 --width 1280 --quality 80
  rm -rf "$TMP"
elif command -v ffmpeg >/dev/null 2>&1; then
  echo "→ ffmpeg 변환 (gifski 미설치 — brew install gifski 권장): $WEBM → $OUT"
  ffmpeg -loglevel error -y -i "$WEBM" \
    -vf "fps=15,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
    "$OUT"
else
  echo "✕ gifski 또는 ffmpeg 가 필요합니다" >&2
  echo "  brew install gifski ffmpeg" >&2
  exit 1
fi

SIZE=$(du -h "$OUT" | cut -f1)
echo "✓ $OUT ($SIZE)"
echo "  README hero 의 주석 라인 활성화 후 commit:"
echo "    <!-- ![xbank 데모](docs/demo.gif) -->  →  ![xbank 데모](docs/demo.gif)"
