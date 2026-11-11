#!/bin/zsh

set -e
cd "$(dirname "$0")"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "找不到 pnpm。請先安裝 Node.js，再執行：corepack enable"
  read "?按 Enter 關閉視窗…"
  exit 1
fi

echo "VIO 本機預覽啟動中…"
echo "預覽啟動後，直接編輯並儲存檔案即可自動更新。"
pnpm dev
