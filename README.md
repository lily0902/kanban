# Kanban 看板系統

一個功能完整的 Kanban 看板管理系統，使用 Vue 3 + Express.js 構建，支援卡片的建立、編輯、刪除和拖曳操作。

## 🚀 功能特性

### ✅ 核心功能
- **卡片管理**: 新增、編輯、刪除卡片
- **狀態流轉**: 四個看板欄位（待處理、進行中、待驗收、已完成）
- **拖曳操作**: HTML5 原生拖拽 API，流暢的視覺回饋
- **即時更新**: 樂觀更新機制，操作立即反映到 UI
- **響應式設計**: 完美適配桌面端和行動端裝置
- **錯誤處理**: 完善的錯誤處理與自動回滾機制

### ✅ 使用者故事驗收
- **US1 新增卡片**: 提供新增按鈕，預設「待處理」狀態，即時顯示
- **US2 狀態管理**: 四個獨立欄位，每張卡片歸屬唯一狀態
- **US3 編輯功能**: 點擊編輯，修改標題描述，狀態選擇器
- **US4 拖曳移動**: 滑鼠拖拽，穩定停留，後端同步更新

## 🏗️ 技術架構

### 前端 (Vue.js 3)
- **框架**: Vue 3 + Composition API
- **建構工具**: Vite 4.4.9
- **樣式**: 原生 CSS，響應式設計
- **HTTP 客戶端**: Axios 1.5.0
- **拖曳功能**: HTML5 Drag & Drop API
- **開發伺服器**: http://localhost:5173

### 後端 (Node.js)
- **框架**: Express.js 4.18.2
- **中介軟體**: CORS, Body Parser
- **資料儲存**: 記憶體儲存（可擴展至資料庫）
- **API 設計**: RESTful API
- **伺服器**: http://localhost:3000

### 開發工具
- **並行啟動**: concurrently 9.2.1
- **熱重載**: Vite HMR + Nodemon
- **模組系統**: ES6 Modules (前端) + CommonJS (後端)

## 📁 專案結構

```
kanban/
├── package.json             # 根目錄依賴和啟動腳本
├── package-lock.json        # 鎖定版本
├── backend/                 # Node.js 後端服務
│   ├── package.json         # 後端相依套件
│   ├── server.js            # Express 伺服器主檔
│   ├── models/
│   │   └── Card.js          # 卡片資料模型
│   └── routes/
│       └── cards.js         # RESTful API 路由
├── frontend/                # Vue.js 前端應用
│   ├── package.json         # 前端相依套件
│   ├── vite.config.js       # Vite 建構配置
│   ├── index.html           # 應用程式入口 HTML
│   └── src/
│       ├── main.js          # Vue 應用程式入口
│       ├── App.vue          # 根元件
│       ├── services/
│       │   └── cardService.js   # API 服務層
│       └── components/
│           ├── KanbanColumn.vue  # 看板欄位元件
│           ├── KanbanCard.vue    # 卡片元件
│           └── CardModal.vue     # 編輯對話框元件
└── README.md                # 專案文件
```

## 🚀 快速開始

### 環境要求
- **Node.js**: 16.0+ 
- **npm**: 8.0+

### 安裝與啟動

#### 1. 安裝相依套件
```bash
# 安裝根目錄依賴 (concurrently)
npm install

# 安裝後端依賴
cd backend
npm install
cd ..

# 安裝前端依賴
cd frontend
npm install
cd ..
```

#### 2. 啟動開發伺服器
```bash
# 在根目錄執行，同時啟動前後端
npm run start
```

這個指令會：
- 🚀 啟動後端 API 伺服器 (http://localhost:3000)
- 🌐 啟動前端開發伺服器 (http://localhost:5173)
- 🔄 啟用熱重載功能

#### 3. 存取應用程式
開啟瀏覽器造訪 http://localhost:5173

### 替代啟動方式

#### 分別啟動 (偵錯用)
```bash
# 啟動後端 (終端 1)
npm run start:backend

# 啟動前端 (終端 2)  
npm run start:frontend
```

#### 生產模式建構
```bash
# 建構前端靜態檔案
cd frontend
npm run build

# 預覽建構結果
npm run preview
```

## 📋 API 介面文件

### 基礎資訊
- **基礎URL**: `http://localhost:3000/api`
- **資料格式**: JSON

### 介面列表

#### 1. 取得所有卡片
```http
GET /api/cards
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "cards": [...],
    "grouped": {
      "todo": [...],
      "inProgress": [...],
      "inReview": [...],
      "done": [...]
    },
    "total": 10
  }
}
```

#### 2. 建立新卡片
```http
POST /api/cards
Content-Type: application/json

{
  "title": "卡片標題",
  "description": "卡片描述",
  "status": "todo"
}
```

#### 3. 更新卡片
```http
PUT /api/cards/:id
Content-Type: application/json

{
  "title": "更新的標題",
  "description": "更新的描述",
  "status": "inProgress"
}
```

#### 4. 刪除卡片
```http
DELETE /api/cards/:id
```

#### 5. 批次更新狀態
```http
PATCH /api/cards/batch-update-status
Content-Type: application/json

{
  "updates": [
    { "id": "卡片ID", "status": "done" }
  ]
}
```

## 🎨 使用者介面

### 設計特色
- **現代化卡片設計**: 毛玻璃效果，優雅陰影
- **響應式布局**: 自動適配桌面、平板、手機
- **流暢動畫**: CSS 轉場動畫，拖拽視覺回饋
- **直覺操作**: 點擊編輯，拖拽移動，按鈕懸停效果

### 互動體驗
- **拖拽操作**: 原生 HTML5 API，流暢拖拽體驗
- **即時反饋**: 操作立即更新 UI，後台同步資料
- **錯誤處理**: 失敗自動回滾，用戶友善提示
- **載入狀態**: 清晰的載入指示器和骨架屏

### 無障礙設計
- **鍵盤導航**: 完整的 Tab 鍵支援
- **螢幕閱讀器**: 語義化 HTML 標籤
- **顏色對比**: 符合 WCAG 2.1 AA 標準
- **焦點管理**: 清晰的焦點指示器

## 🔧 開發與擴展

### 資料模型定義
```javascript
// Card 模型結構
{
  id: "uuid",              // 唯一識別符
  title: "string",         // 卡片標題 (必填)
  description: "string",   // 卡片描述 (選填)
  status: "enum",          // 狀態: todo|inProgress|inReview|done
  createdAt: "ISO string", // 建立時間
  updatedAt: "ISO string"  // 更新時間
}
```

### 狀態管理流程
```
待處理 (todo) → 進行中 (inProgress) → 待驗收 (inReview) → 已完成 (done)
```

### 核心技術實現

#### 前端架構
- **Vue 3 Composition API**: 邏輯組合與狀態管理
- **Vite 代理設定**: `/api` 路由代理到後端 3000 端口
- **Axios 攔截器**: 統一錯誤處理與請求日誌
- **HTML5 拖拽**: `dragstart`、`dragover`、`drop` 事件處理

#### 後端架構
- **Express 中介軟體**: CORS、JSON 解析、錯誤處理
- **RESTful 路由**: 標準 GET/POST/PUT/DELETE 操作
- **記憶體儲存**: Array 結構，支援 CRUD 與狀態查詢
- **錯誤處理**: 統一錯誤格式與 HTTP 狀態碼

### 建議擴展功能
1. **資料持久化**: MongoDB/PostgreSQL 整合
2. **使用者系統**: 登入、權限管理、多租戶
3. **即時協作**: WebSocket 多人同步編輯
4. **進階功能**: 檔案上傳、標籤系統、截止日期
5. **效能優化**: Redis 快取、分頁載入、虛擬滾動

## 🐛 故障排除

### 常見問題與解決方案

#### 1. 啟動失敗
```bash
# 檢查 Node.js 版本
node --version  # 需要 16+
npm --version   # 需要 8+

# 清理依賴重新安裝
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. 端口衝突
```bash
# Windows: 檢查端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# 終止佔用進程
taskkill /PID <PID號碼> /F

# macOS/Linux: 檢查端口占用
lsof -i :3000
lsof -i :5173

# 終止佔用進程
kill -9 <PID號碼>
```

#### 3. API 連線錯誤
- **檢查後端**: 確認 http://localhost:3000 可正常存取
- **CORS 設定**: 確認後端已啟用 CORS 中介軟體
- **代理設定**: 檢查 `frontend/vite.config.js` 代理配置

#### 4. 前端建構錯誤
```bash
# 檢查 Vite 配置
cd frontend
npm run build --verbose

# 檢查依賴版本衝突
npm ls
```

#### 5. 拖拽功能異常
- **瀏覽器支援**: 確認支援 HTML5 Drag & Drop API
- **事件處理**: 檢查 `dragstart`、`dragover`、`drop` 事件
- **資料傳遞**: 確認 `dataTransfer` 正確設定 JSON 資料

### 偵錯工具
- **瀏覽器開發者工具**: Console、Network、Elements 面板
- **Vue DevTools**: Vue 3 元件狀態偵錯
- **後端日誌**: Express 請求/回應日誌
- **API 測試**: Postman 或 curl 測試 RESTful API

## 📝 版本歷程

### v1.0.0 (2025-10-27)
**完整 Kanban 看板系統實現**

#### ✅ 核心功能
- 實現完整的卡片 CRUD 操作（新增、編輯、刪除）
- 四狀態看板欄位：待處理、進行中、待驗收、已完成
- HTML5 原生拖拽功能，跨欄位移動卡片
- Vue 3 響應式 UI 更新，樂觀更新機制

#### ✅ 技術架構
- 前端：Vue 3 + Vite + Composition API
- 後端：Express.js + RESTful API 設計
- 開發工具：concurrently 並行啟動
- 樣式：原生 CSS，完整響應式設計

#### ✅ 使用者體驗
- 現代化 UI 設計，毛玻璃效果
- 流暢的拖拽動畫與視覺回饋
- 完善的錯誤處理與狀態回滾
- 跨裝置響應式支援

#### ✅ 開發體驗
- 熱重載開發環境
- TypeScript 類型提示支援
- 清晰的專案結構與模組化設計
- 完整的 API 文件與故障排除指南

---
