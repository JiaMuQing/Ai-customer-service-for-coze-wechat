# AI 客服管理系统

基于 Node + Vue + MySQL + Redis，接入扣子（Coze）与企业微信智能机器人，实现群/单聊 AI 客服与简单管理后台。

## 技术栈

- **后端**：Nest.js、TypeORM、MySQL、Redis（配置在 .env，本期未用 Redis 业务逻辑，可后续加队列/缓存）
- **前端**：Vue 3、Vite、Pinia、Element Plus
- **登录**：固定用户名/密码（.env 配置），无权限系统

## 环境变量

- 复制 `backend/.env.example` 为 `backend/.env`，按注释填写。
- 复制 `frontend/.env.example` 为 `frontend/.env`，填写 `VITE_API_BASE_URL`。
- 完整参数说明见 [docs/ENV.md](docs/ENV.md)。

## 本地运行

**详细步骤见 [docs/local-setup.md](docs/local-setup.md)。**

1. **建库**：MySQL 里执行 `CREATE DATABASE ai_customer_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`，表由后端自动创建，结构见 [docs/database.md](docs/database.md)。
2. **后端**：`cd backend` → 复制 `.env.example` 为 `.env` 并填写 → `npm install` → `npm run start:dev`。
3. **前端**：`cd frontend` → 复制 `.env.example` 为 `.env`（开发可保持 `VITE_API_BASE_URL=/api`）→ `npm install` → `npm run dev`。

- 后端：http://localhost:3000  
- 前端：http://localhost:5173（代理 /api 到 3000）  
- 登录：使用 `backend/.env` 中的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`。

## 企业微信回调

- 接收消息 URL：`https://你的域名/wecom/callback`（GET 用于验证，POST 用于接收消息）
- 需配置 `WECOM_BOT_TOKEN`、`WECOM_BOT_AES_KEY` 与后台一致。

## 项目结构

- `backend/`：Nest 后端（auth、wecom 回调、coze 对话、群绑定、会话记录）
- `frontend/`：Vue 管理端（登录、群绑定、会话记录）
- `docs/plan.md`：项目计划；`docs/ENV.md`：环境变量说明
