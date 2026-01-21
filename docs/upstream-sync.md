# 上游同步指南

本專案是 [Cli-Proxy-API-Management-Center](https://github.com/router-for-me/Cli-Proxy-API-Management-Center) 的繁體中文 Fork。

當上游有更新時，按照以下步驟同步。

---

## 快速同步流程

### 1. 拉取合併上游

```bash
git fetch upstream
git merge upstream/main
```

> 首次設定 upstream remote：
> ```bash
> git remote add upstream https://github.com/router-for-me/Cli-Proxy-API-Management-Center.git
> ```

### 2. 重新產生 zh-TW.json

```bash
opencc -i src/i18n/locales/zh-CN.json -o src/i18n/locales/zh-TW.json -c s2twp
```

### 3. 檢查 TW 專屬修改

合併後確認以下修改仍存在，**如被上游覆蓋則需還原**：

| 檔案 | 檢查內容 |
|------|----------|
| `src/types/common.ts:7` | Language 型別含 `'zh-TW'` |
| `src/i18n/index.ts` | import zhTW + resources + fallbackLng array |
| `src/utils/language.ts` | getBrowserLanguage 含 BCP 47 判斷 |
| `src/stores/useLanguageStore.ts` | toggleLanguage 三語循環 |
| `src/pages/LoginPage.tsx:34-38` | nextLanguageLabel 三語支援 |
| `zh-CN.json`, `en.json` | language.traditional 欄位 |

### 4. 驗證

```bash
npm run type-check && npm run lint
```

### 5. 測試

```bash
npm run dev
```

瀏覽器測試語言切換：繁體 → 簡體 → 英文 循環

---

## 使用 Claude Code 同步

直接告訴 Claude Code：

> 「同步上游」或「更新上游」

Claude Code 會自動執行上述流程並報告結果。

---

## 建立 Release

推送以 `v` 開頭的 tag，CI 會自動建立 GitHub Release。

### 發布步驟

```bash
# 1. 推送 commits
git push

# 2. 建立並推送 tag
git tag v1.2.22
git push origin v1.2.22
```

CI 會自動：
1. Build → 產生 `dist/index.html`
2. 重命名為 `management.html`
3. 建立 GitHub Release 並附加檔案

### Fork 專案首次發布

Fork 的專案預設禁用 GitHub Actions，需手動啟用：

1. 前往 repository 的 **Actions** 頁籤
2. 點擊 **"I understand my workflows, go ahead and enable them"**
3. 重新推送 tag 觸發 workflow：

```bash
# 刪除並重新推送 tag
git push origin :refs/tags/v1.2.22
git push origin v1.2.22
```

### 查看 Release 狀態

- CI 進度：`https://github.com/<user>/<repo>/actions`
- Release 頁面：`https://github.com/<user>/<repo>/releases`

---

## 詳細文件

完整的繁體中文化實作細節請參考：[`docs/plan/zh-TW-localization.md`](./plan/zh-TW-localization.md)
