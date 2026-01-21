# CLIProxyAPI 整合指南

本專案是 [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 的管理介面前端。

## 專案關係

```
CLIProxyAPI（Go 後端）
    │
    ├─ 提供 /v0/management API（管理端點）
    │
    └─ managementasset 模組
         └─ 自動從 GitHub Release 下載 management.html
         └─ 每 3 小時檢查更新
         └─ 提供給 http://<host>/management.html
                   │
                   └── 本專案的建置產物
```

## 運作原理

1. 本專案 `npm run build` → `dist/index.html`
2. CI 重命名為 `management.html` 並上傳到 GitHub Release
3. CLIProxyAPI 後端自動下載並在 `/management.html` 路徑提供

## 使用自訂管理介面

### 前提條件

確保本專案有 GitHub Release（推送 tag 即可觸發 CI）：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### CLIProxyAPI 設定

在 CLIProxyAPI 的 `config.yaml` 中設定：

```yaml
remote-management:
  allow-remote: true  # 允許遠端存取（預設僅本地）
  secret-key: "your-secret-key"  # 管理金鑰
  disable-control-panel: false  # 設為 true 則不載入管理介面
  panel-github-repository: "https://github.com/{owner}/{repo}"
```

### `panel-github-repository` 支援格式

| 格式 | 範例 |
|------|------|
| github.com | `https://github.com/yelban/Cli-Proxy-API-Management-Center.TW` |
| api.github.com | `https://api.github.com/repos/yelban/Cli-Proxy-API-Management-Center.TW` |
| 空值 | 使用預設 `router-for-me/Cli-Proxy-API-Management-Center` |

**注意**：不需要 `/tree/main`，只要 `https://github.com/{owner}/{repo}` 即可。

### URL 解析邏輯

CLIProxyAPI 的 `managementasset/updater.go` 會將設定轉換為 GitHub API URL：

```
https://github.com/yelban/Cli-Proxy-API-Management-Center.TW
    ↓ 轉換為
https://api.github.com/repos/yelban/Cli-Proxy-API-Management-Center.TW/releases/latest
```

然後下載 Release 中名為 `management.html` 的 asset。

## Release 要求

GitHub Release 必須包含名為 **`management.html`** 的 asset。

本專案的 `.github/workflows/release.yml` 已設定自動處理：

```yaml
- name: Prepare release assets
  run: |
    cd dist
    mv index.html management.html
```

## 備用機制

若無法從 GitHub 下載，CLIProxyAPI 會嘗試備用 CDN：
- `https://cpamc.router-for.me/`

## 相關檔案

- CLIProxyAPI: `internal/managementasset/updater.go` - 管理介面下載邏輯
- CLIProxyAPI: `internal/config/config.go:135` - `PanelGitHubRepository` 設定欄位
- 本專案: `.github/workflows/release.yml` - CI 建置與發佈
