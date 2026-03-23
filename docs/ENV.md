# 环境变量说明 — 需要你填写的参数

所有配置均通过 `.env` 管理。后端见 `backend/.env.example`，前端见 `frontend/.env.example`。  
**以下列出必须由你填写或申请的项，未列出的可保持示例默认值。**

---

## 后端 `backend/.env`

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| **ADMIN_USERNAME** | 管理后台登录用户名（固定账号） | 自定义，写死即可 |
| **ADMIN_PASSWORD** | 管理后台登录密码（固定账号） | 自定义，写死即可 |
| **JWT_SECRET** | JWT 签发密钥，建议 32 位以上随机字符串 | 自行生成 |
| **DB_HOST** | MySQL 主机 | 本地填 `localhost` |
| **DB_PORT** | MySQL 端口 | 默认 `3306` |
| **DB_DATABASE** | 数据库名（需先手动建库） | 如 `ai_customer_service` |
| **DB_USERNAME** | 数据库用户名 | 如 `root` |
| **DB_PASSWORD** | 数据库密码 | 你的 MySQL 密码 |
| **COZE_PAT** | 扣子开放平台 PAT（个人访问令牌） | 扣子开放平台 → 开发者设置 → 个人访问令牌，权限含 chat、知识库等 |
| **COZE_BOT_ID** | 扣子 Bot ID | 扣子 Bot 开发页 URL 或发布设置中获取 |

可选：

- **BASE_URL**：部署后的公网域名（如 `https://your-domain.com`）。
- **PORT**：后端端口，默认 `3000`。
- **COZE_API_BASE**：扣子 API 根地址，默认 `https://api.coze.cn`。
- **COZE_DEBUG**：设为 `1` / `true` / `yes` 时，后端在终端打印 `/v3/chat` 请求体与扣子返回的完整 JSON（**仅本地排错**，勿在生产开启）。
- **COZE_POLL_INTERVAL_MS**：非流式对话轮询 `retrieve` 间隔（毫秒），默认 `500`。
- **COZE_POLL_TIMEOUT_MS**：轮询最长等待（毫秒），默认 `120000`；超时会尝试调用取消对话接口。

---

## 前端 `frontend/.env`

| 变量 | 说明 | 填写建议 |
|------|------|----------|
| **VITE_API_BASE_URL** | 后端 API 根地址 | 开发填 `/api`（由 Vite 代理到后端）；生产填实际后端域名，如 `https://api.your-domain.com` |

