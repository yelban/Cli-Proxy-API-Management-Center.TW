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

## 詳細文件

完整的繁體中文化實作細節請參考：[`docs/plan/zh-TW-localization.md`](./plan/zh-TW-localization.md)
