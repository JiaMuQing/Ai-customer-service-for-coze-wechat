# AI 客服管理系统

基于 Node + Vue + MySQL，接入扣子（Coze）：**独立访客聊天页**（`/chat`，免登录）与**后台会话查询**（`/admin`，需登录）。

## 技术栈

- **后端**：Nest.js、TypeORM、MySQL
- **前端**：Vue 3、Vite、Pinia、Element Plus
- **后台登录**：固定用户名/密码（.env），仅用于 `/admin`；聊天页不登录

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
- 访客聊天：**http://localhost:5173/chat**（或根路径 `/` 会跳到 `/chat`），无需登录。  
- 后台：访问 **http://localhost:5173/login**，使用 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 登录后进入 **会话记录**（`/admin/session`）。

## 项目结构

- `backend/`：Nest 后端（auth、扣子对话、网页聊天 API、会话记录）
- `frontend/`：Vue 端（独立 `/chat`、后台 `/admin` + 登录）
- `docs/plan.md`：项目计划；`docs/ENV.md`：环境变量说明
