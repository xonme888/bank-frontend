#!/usr/bin/env bash
# Playwright demo project 의 모든 video.webm → docs/demo-<name>.gif 변환.
#
# Playwright 가 test 별로 별도 디렉토리·video.webm 을 만든다:
#   test-results/demo-recording-fds-rejection-demo/video.webm
#   test-results/demo-recording-transfer-pair-demo/video.webm
#   ...
# 이 스크립트가 디렉토리 이름에서 test 제목을 추출해 docs/demo-<title>.gif 로 저장.

set -euo pipefail

mkdir -p docs

# gifski + ffmpeg 둘 다 권장 (gifski 가 더 깔끔, ffmpeg 가 .webm 디코딩)
HAS_GIFSKI=0
HAS_FFMPEG=0
command -v gifski >/dev/null 2>&1 && HAS_GIFSKI=1
command -v ffmpeg >/dev/null 2>&1 && HAS_FFMPEG=1

if [ "$HAS_GIFSKI$HAS_FFMPEG" = "00" ]; then
  echo "✕ gifski 또는 ffmpeg 가 필요합니다 — brew install gifski ffmpeg" >&2
  exit 1
fi

CONVERTED=0
# Playwright 디렉토리 패턴 예: "demo-recording.ts-fds-rejection-demo".
# 앞뒤 토막 제거 후 docs/demo-<title>.gif.
while IFS= read -r -d '' webm; do
  dir=$(dirname "$webm")
  base=$(basename "$dir")
  title=${base#demo-recording.ts-}     # 앞 "demo-recording.ts-" 제거 (점 포함)
  title=${title#demo-recording-}        # 점 없는 변형도 호환
  title=${title%-demo}                  # 뒤 "-demo" 제거
  title=${title%-retry*}                # 재실행 retry suffix 제거

  out="docs/demo-${title}.gif"
  echo "→ $title  ($webm → $out)"

  # ffmpeg 의 -nostdin 필수 — 미설정 시 첫 호출이 stdin 의 한 글자를 소비해
  # 다음 iteration 의 path 첫 글자가 잘리는 hideous 버그 발생.
  if [ "$HAS_GIFSKI" = "1" ] && [ "$HAS_FFMPEG" = "1" ]; then
    tmp=$(mktemp -d)
    ffmpeg -nostdin -loglevel error -y -i "$webm" \
      -vf "fps=15,scale=1280:-1:flags=lanczos" "$tmp/frame_%04d.png"
    gifski "$tmp"/frame_*.png -o "$out" --fps 15 --width 1280 --quality 80
    rm -rf "$tmp"
  else
    ffmpeg -nostdin -loglevel error -y -i "$webm" \
      -vf "fps=15,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
      "$out"
  fi

  size=$(du -h "$out" | cut -f1)
  echo "  ✓ $out ($size)"
  CONVERTED=$((CONVERTED + 1))
done < <(find test-results -type f -name "video.webm" -path "*demo*" -print0)

if [ "$CONVERTED" = "0" ]; then
  echo "✕ video.webm 을 찾을 수 없습니다 — npm run demo:record 먼저 실행" >&2
  exit 1
fi

echo ""
echo "✓ $CONVERTED 개 GIF 생성 완료. README hero 의 임베드 라인이 활성화되어 있는지 확인."
ls -lh docs/demo-*.gif | awk '{print "  "$NF" — "$5}'
