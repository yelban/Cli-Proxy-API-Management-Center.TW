# Management UI 繁體中文化計畫

## 現況確認

| 項目 | 內容 |
|------|------|
| 上游倉庫 | `router-for-me/Cli-Proxy-API-Management-Center` |
| 本地 Fork | `Cli-Proxy-API-Management-Center.TW` |
| i18n 框架 | i18next + react-i18next |
| 現有語言 | `en.json`、`zh-CN.json` |
| 簡體中文行數 | ~910 行 |

**✅ openCC + s2twp 可行！** zh-CN.json 全是簡體中文字串。

---

## 為什麼選擇 opencc

對於 JSON 語言檔，**opencc + s2twp** 是最簡單有效的方式：

```bash
opencc -i zh-CN.json -o zh-TW.json -c s2twp
```

| 優點 | 說明 |
|------|------|
| 一行指令 | 無需逐行處理，整檔轉換 |
| 台灣慣用詞 | s2twp 包含詞彙轉換（信息→訊息、視頻→影片） |
| 可重複執行 | 上游更新後重跑即可 |
| 本地工具 | macOS 已安裝 opencc |

其餘需要手動修改的檔案（型別定義、i18n 設定、語言偵測邏輯）都是**一次性設定**，之後上游更新只需重跑 opencc。

---

## 待修改檔案清單

| 檔案 | 行號 | 修改內容 |
|------|------|----------|
| `src/i18n/locales/zh-TW.json` | - | **新增** - openCC s2twp 產生 |
| `src/types/common.ts` | 7 | `Language` 型別加入 `'zh-TW'` |
| `src/i18n/index.ts` | 7-17 | import zhTW + resources 註冊 + fallbackLng |
| `src/utils/language.ts` | 4-55 | parseStoredLanguage + getBrowserLanguage 支援 zh-TW |
| `src/stores/useLanguageStore.ts` | 30-38 | toggleLanguage() 三語循環 |
| `src/pages/LoginPage.tsx` | 34-38 | nextLanguageLabel 三語支援 |
| `src/i18n/locales/zh-CN.json` | 887-891 | language 區塊加 traditional |
| `src/i18n/locales/en.json` | 887-891 | language 區塊加 traditional |

---

## 實作步驟

### 1. 建立繁體中文語言檔

```bash
cd Cli-Proxy-API-Management-Center.TW

# 使用 openCC 轉換（s2twp = 簡體到繁體台灣慣用詞）
opencc -i src/i18n/locales/zh-CN.json \
       -o src/i18n/locales/zh-TW.json \
       -c s2twp
```

### 2. 修改 types/common.ts

```typescript
// 第 7 行，原本
export type Language = 'zh-CN' | 'en';
// 改為
export type Language = 'zh-CN' | 'zh-TW' | 'en';
```

### 3. 修改 i18n/index.ts

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';  // 新增
import en from './locales/en.json';
import { getInitialLanguage } from '@/utils/language';

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },  // 新增
    en: { translation: en }
  },
  lng: getInitialLanguage(),
  fallbackLng: 'zh-TW',  // 改為繁體中文
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
});

export default i18n;
```

### 4. 修改 utils/language.ts

```typescript
import type { Language } from '@/types';
import { STORAGE_KEY_LANGUAGE } from '@/utils/constants';

const VALID_LANGUAGES: Language[] = ['zh-TW', 'zh-CN', 'en'];

const parseStoredLanguage = (value: string): Language | null => {
  try {
    const parsed = JSON.parse(value);
    const candidate = parsed?.state?.language ?? parsed?.language ?? parsed;
    if (VALID_LANGUAGES.includes(candidate)) {
      return candidate;
    }
  } catch {
    if (VALID_LANGUAGES.includes(value as Language)) {
      return value as Language;
    }
  }
  return null;
};

const getStoredLanguage = (): Language | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (!stored) {
      return null;
    }
    return parseStoredLanguage(stored);
  } catch {
    return null;
  }
};

const getBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') {
    return 'zh-TW';
  }
  const raw = (navigator.languages?.[0] || navigator.language || 'zh-TW').toLowerCase();

  // 非中文 → 英文
  if (!raw.startsWith('zh')) {
    return 'en';
  }

  // BCP 47 中文語言代碼對應：
  // 繁體：zh-TW, zh-HK, zh-MO, zh-Hant, zh-Hant-*
  // 簡體：zh-CN, zh-SG, zh-Hans, zh-Hans-*
  // 純 zh：預設繁體（台灣用戶較多使用此專案）

  // 簡體地區/腳本
  if (raw === 'zh-cn' || raw === 'zh-sg' || raw.includes('hans')) {
    return 'zh-CN';
  }

  // 繁體地區/腳本（含純 zh 預設）
  return 'zh-TW';
};

export const getInitialLanguage = (): Language => getStoredLanguage() ?? getBrowserLanguage();
```

**BCP 47 語言代碼對應表：**

| 瀏覽器語言代碼 | 對應語言 | 說明 |
|---------------|---------|------|
| `zh-CN`, `zh-SG` | 簡體 | 中國、新加坡 |
| `*hans*` | 簡體 | zh-Hans, zh-Hans-CN 等 |
| `zh-TW`, `zh-HK`, `zh-MO` | 繁體 | 台灣、香港、澳門 |
| `*hant*` | 繁體 | zh-Hant, zh-Hant-TW 等 |
| `zh` | 繁體 | 純 zh 預設繁體 |
| 非 `zh` 開頭 | 英文 | en-US, ja, ko 等 |

### 5. 修改 stores/useLanguageStore.ts

```typescript
toggleLanguage: () => {
  const { language, setLanguage } = get();
  // 三語循環：zh-TW → zh-CN → en → zh-TW
  const cycle: Record<Language, Language> = {
    'zh-TW': 'zh-CN',
    'zh-CN': 'en',
    'en': 'zh-TW'
  };
  setLanguage(cycle[language]);
}
```

### 6. 修改 pages/LoginPage.tsx

語言切換按鈕顯示「下一個語言」的標籤，需改為三語支援：

```typescript
// 原本（第 34 行）
const nextLanguageLabel = language === 'zh-CN' ? t('language.english') : t('language.chinese');

// 改為
// 循環：繁體 → 簡體 → 英文
const nextLanguageLabel =
  language === 'zh-TW'
    ? t('language.chinese')
    : language === 'zh-CN'
      ? t('language.english')
      : t('language.traditional');
```

### 7. 修改語言檔的語言選項

**zh-CN.json** 第 887-891 行：
```json
"language": {
  "switch": "语言",
  "chinese": "简体中文",
  "traditional": "繁體中文",
  "english": "English"
}
```

**zh-TW.json** 會自動轉換，但需確認：
```json
"language": {
  "switch": "語言",
  "chinese": "簡體中文",
  "traditional": "繁體中文",
  "english": "English"
}
```

**en.json** 第 887-891 行：
```json
"language": {
  "switch": "Language",
  "chinese": "Simplified Chinese",
  "traditional": "Traditional Chinese",
  "english": "English"
}
```

### 8. 建置與測試

```bash
npm run type-check   # TypeScript 檢查
npm run lint         # ESLint 檢查
npm run dev          # 本地測試語言切換
npm run build        # 產生 dist/index.html
```

### 9. 發布 Release

推送 tag 觸發 CI：
```bash
git tag v1.0.0
git push origin v1.0.0
```

CI 會自動將 `dist/index.html` 重命名為 `management.html` 並建立 GitHub Release。

---

## 上游更新合併策略

### 檔案分類

| 分類 | 檔案 | 更新處理 |
|------|------|----------|
| **上游覆寫** | 大部分檔案 | 直接使用上游版本 |
| **重新產生** | `zh-TW.json` | openCC 從 zh-CN.json 轉換 |
| **智慧合併** | `language.ts`, `useLanguageStore.ts`, `common.ts`, `i18n/index.ts`, `LoginPage.tsx` | git merge 自動或手動合併 |
| **手動合併** | `zh-CN.json`, `en.json` | 合併上游 + 保留 traditional 欄位 |

### 「智慧合併」檔案處理

這些檔案**上游也會更新**，但我們只修改特定區域：

| 檔案 | 我們修改的區域 | 上游可能修改的區域 |
|------|----------------|-------------------|
| `common.ts` | `Language` 型別（第 7 行） | 其他型別定義 |
| `i18n/index.ts` | import + resources + fallbackLng | 其他 i18n 設定 |
| `language.ts` | 語言判斷邏輯 | 儲存邏輯、常數 |
| `useLanguageStore.ts` | `toggleLanguage` 函式 | 其他 store 邏輯 |
| `LoginPage.tsx` | `nextLanguageLabel`（第 34-38 行） | 登入頁其他邏輯 |

**合併策略：**

```
git merge upstream/main
    ↓
┌─ 無衝突 ─→ 檢查 TW 修改是否還在 ─→ OK
│
└─ 有衝突 ─→ 手動解決，保留兩邊修改 ─→ OK
```

**衝突解決原則：**
- 上游新增的功能：保留
- 上游修改我們的區域：合併（同時保留上游改進 + TW 功能）
- 上游刪除我們需要的程式碼：還原我們的修改

### 工作流程

```
git fetch upstream
    ↓
git merge upstream/main（或 git reset --hard upstream/main）
    ↓
解決衝突 / 還原本地修改
    ↓
opencc 重新產生 zh-TW.json
    ↓
確認 language 區塊有 traditional
    ↓
npm run type-check && npm run lint
    ↓
npm run build && 發布
```

### 具體指令

```bash
# 設定上游 remote（首次）
git remote add upstream https://github.com/router-for-me/Cli-Proxy-API-Management-Center.git

# 同步上游更新
git fetch upstream
git checkout main
git merge upstream/main
```

**情況 A：無衝突**
```bash
# 檢查 TW 修改是否還在
git diff HEAD~1 src/types/common.ts      # 應該看到 'zh-TW'
git diff HEAD~1 src/i18n/index.ts        # 應該看到 zhTW import
git diff HEAD~1 src/utils/language.ts    # 應該看到 zh-TW 判斷
git diff HEAD~1 src/stores/useLanguageStore.ts  # 應該看到三語循環
git diff HEAD~1 src/pages/LoginPage.tsx  # 應該看到 nextLanguageLabel 三語

# 如果 TW 修改消失了，從之前的 commit 還原
git show HEAD~1:src/types/common.ts > src/types/common.ts
# （或手動重新修改）
```

**情況 B：有衝突**
```bash
# 手動編輯衝突檔案，保留上游改進 + TW 功能
# 標記解決
git add <conflicted-files>
git commit
```

**最後步驟（兩種情況都需要）**
```bash
# 重新產生繁體中文（上游 zh-CN.json 可能有更新）
opencc -i src/i18n/locales/zh-CN.json \
       -o src/i18n/locales/zh-TW.json \
       -c s2twp

# 確認 zh-CN.json 和 en.json 的 language 區塊有 traditional
# （如果上游覆寫了，需手動加回）

# 驗證
npm run type-check && npm run lint

# 建置
npm run build
```

### 同步後檢查清單

每次上游同步後，確認以下 TW 專屬修改存在（可能需要重新套用或合併）：

**1. `src/types/common.ts:7`**
```typescript
export type Language = 'zh-CN' | 'zh-TW' | 'en';
```

**2. `src/i18n/index.ts`**
- import zhTW
- resources 含 zh-TW
- fallbackLng: 'zh-TW'

**3. `src/utils/language.ts`**
- parseStoredLanguage 含 'zh-TW' 判斷
- getBrowserLanguage 含 zh-tw/zh-hant 判斷
- 預設值為 'zh-TW'

**4. `src/stores/useLanguageStore.ts`**
- toggleLanguage 三語循環

**5. `src/pages/LoginPage.tsx`**
- nextLanguageLabel 三語支援（繁體→簡體→英文）

**6. `src/i18n/locales/zh-CN.json` & `en.json`**
- language.traditional 欄位

### 自動化 GitHub Actions（可選）

```yaml
# .github/workflows/sync-upstream.yml
name: Sync Upstream & Build
on:
  schedule:
    - cron: '0 0 * * 1'  # 每週一
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Sync upstream
        run: |
          git remote add upstream https://github.com/router-for-me/Cli-Proxy-API-Management-Center.git
          git fetch upstream
          git merge upstream/main --no-edit || echo "需手動解決衝突"

      - name: Convert to Traditional Chinese
        run: |
          pip install opencc-python-reimplemented
          python -c "
          import opencc
          cc = opencc.OpenCC('s2twp')
          with open('src/i18n/locales/zh-CN.json', 'r') as f:
              content = f.read()
          with open('src/i18n/locales/zh-TW.json', 'w') as f:
              f.write(cc.convert(content))
          "

      - name: Build
        run: |
          npm ci
          npm run build

      - name: Create Release
        # ... 自動建立 release
```

---

## CLIProxyAPI 設定

在 `config.yaml` 指向你的 fork：

```yaml
remote-management:
  panel-github-repository: "https://github.com/yelban/Cli-Proxy-API-Management-Center.TW"
```

---

## 驗證方式

1. `npm run dev` 啟動開發伺服器
2. 開啟瀏覽器，切換語言到繁體中文
3. 確認所有介面文字正確顯示
4. 確認三語循環正常：繁體 → 簡體 → 英文 → 繁體
5. `npm run build` 建置
6. 將 `dist/index.html` 部署測試
