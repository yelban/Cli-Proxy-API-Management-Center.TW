# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**繁體中文 Fork** of CLI Proxy API Management Center WebUI.

Single-file React WebUI for managing **CLI Proxy API** via its Management API (`/v0/management`). Builds to a single `dist/index.html` with all assets inlined.

| 項目 | 連結 |
|------|------|
| 上游倉庫 | https://github.com/router-for-me/Cli-Proxy-API-Management-Center |
| 主專案 | https://github.com/router-for-me/CLIProxyAPI |

## 上游同步（Upstream Sync）

當用戶說「**同步上游**」或「**更新上游**」時，執行以下流程：

### 執行步驟

1. **拉取合併上游**
   ```bash
   git fetch upstream && git merge upstream/main
   ```

2. **重新產生 zh-TW.json**
   ```bash
   opencc -i src/i18n/locales/zh-CN.json -o src/i18n/locales/zh-TW.json -c s2twp
   ```

3. **檢查 TW 專屬修改是否存在**（如被覆蓋則還原）

4. **驗證**
   ```bash
   npm run type-check && npm run lint
   ```

5. **報告結果**

### TW 專屬修改檢查清單

| 檔案 | 檢查內容 |
|------|----------|
| `src/types/common.ts:7` | Language 含 `'zh-TW'` |
| `src/i18n/index.ts` | import zhTW + resources + fallbackLng |
| `src/utils/language.ts` | getBrowserLanguage 含 BCP 47 判斷 |
| `src/stores/useLanguageStore.ts` | toggleLanguage 三語循環 |
| `src/pages/LoginPage.tsx:34-38` | nextLanguageLabel 三語支援 |
| `zh-CN.json`, `en.json` | language.traditional 欄位 |

**詳細文件**：`docs/plan/zh-TW-localization.md`

## Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # tsc + Vite → dist/index.html (single file)
npm run preview      # Serve dist locally
npm run lint         # ESLint (fails on warnings)
npm run format       # Prettier
npm run type-check   # tsc --noEmit
```

## Architecture

### Tech Stack
- React 19 + TypeScript 5.9 + Vite 7
- Zustand (state) + react-router-dom 7 (hash routing)
- SCSS modules + Chart.js + GSAP animations
- i18next (EN/ZH-CN/ZH-TW trilingual)
- vite-plugin-singlefile (inlines all assets)

### Directory Structure
```
src/
├── pages/           # 13 page components (Dashboard, Settings, ApiKeys, etc.)
├── components/
│   ├── layout/      # MainLayout with sidebar navigation
│   ├── common/      # ConfirmationModal, NotificationContainer, etc.
│   ├── ui/          # Button, Input, Card, Modal, ToggleSwitch, etc.
│   └── providers/   # Gemini/Claude/Codex/OpenAI/Vertex/Ampcode sections
├── services/api/    # 16 API modules (client.ts, apiCall.ts, providers.ts, etc.)
├── stores/          # 8 Zustand stores (auth, config, theme, language, etc.)
├── hooks/           # useApi, useDebounce, useInterval, usePagination, etc.
├── types/           # TypeScript interfaces (api, auth, provider, etc.)
├── utils/           # Helpers, validation, formatting, quota parsers
├── i18n/locales/    # en.json, zh-CN.json, zh-TW.json (~45KB each)
└── styles/          # SCSS variables, themes, mixins
```

### Key Patterns

**API Layer**: Singleton `ApiClient` (Axios) with interceptors for management key injection, 401 handling, and server version detection. All endpoints in `services/api/`.

**State**: Multiple focused Zustand stores. Auth store uses `secureStorage.ts` with lightweight XOR obfuscation (`enc::v1::` format).

**Routing**: Hash-based (`#/dashboard`, `#/settings`) for `file://` compatibility. `ProtectedRoute` guards authenticated pages.

**UI**: Global `ConfirmationModal` replaces `window.confirm`. Toast notifications via `useNotificationStore`.

### Path Alias
`@/` → `./src/` (configured in `vite.config.ts` and `tsconfig.json`)

## Build Notes

- Single HTML output via vite-plugin-singlefile (no external requests)
- Version injected at build: `VERSION` env → git tag → package.json
- CI renames `index.html` → `management.html` for releases
- Tagged `vX.Y.Z` triggers GitHub Actions release
- See `docs/integration.md` for CLIProxyAPI integration setup

## Code Style

- TypeScript strict mode (no unused vars/params)
- Prettier: 100-char width, single quotes, semicolons, trailing commas
- ESLint: React Hooks + React Refresh plugins
- SCSS modules with automatic variables import
