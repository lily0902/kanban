const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cardRoutes = require("./routes/cards");

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由配置
app.use("/api/cards", cardRoutes);

// 基礎路由
app.get("/", (req, res) => {
  res.json({
    message: "Kanban 看板系統 API 伺服器運行中",
    version: "1.0.0",
    endpoints: {
      "GET /api/cards": "取得所有卡片",
      "POST /api/cards": "建立新卡片",
      "PUT /api/cards/:id": "更新卡片",
      "DELETE /api/cards/:id": "刪除卡片",
    },
  });
});

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "伺服器內部錯誤",
    message: err.message,
  });
});

// 404 處理
app.use("*", (req, res) => {
  res.status(404).json({
    error: "路由不存在",
    path: req.originalUrl,
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {});

server.on("error", (err) => {
  console.error("❌ 服務器錯誤:", err);
  process.exit(1);
});

// Only export for testing purposes
if (require.main !== module) {
  module.exports = app;
}
